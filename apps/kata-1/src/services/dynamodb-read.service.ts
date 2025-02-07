import {
  ConsoleLogger,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common'
import { Readable } from 'node:stream'
import { IReadStreamService } from '../interfaces'
import { createReadStream, createWriteStream } from 'node:fs'
import { ConfigService } from '@nestjs/config'
import { spawn } from 'child_process'

@Injectable()
export class DynamodbReadService implements IReadStreamService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(ConsoleLogger) private readonly loggerService: LoggerService,
  ) {}

  async read(
    segment: number = 0,
    totalSegments: number = 1,
  ): Promise<Readable> {
    this.loggerService.debug(`Scanning segment ${segment} of ${totalSegments}`)
    const fileName = await this.scanInSpawn(segment, totalSegments)
    this.loggerService.debug(
      `Reading file ${fileName} of segment ${segment} of ${totalSegments}`,
    )

    return createReadStream(fileName, { highWaterMark: 1 })
  }

  async scanInSpawn(segment: number, totalSegments: number): Promise<string> {
    const tableName = this.configService.get<string>('dynamodb.tableName')
    const resultFile = `./result-program${segment}.csv`

    if (!tableName || !resultFile) {
      throw new Error(
        'Missing configuration for DynamoDB table or result file.',
      )
    }

    return new Promise((resolve, reject) => {
      const awsScan = spawn('aws', [
        'dynamodb',
        'scan',
        '--table-name',
        tableName,
        '--select',
        'ALL_ATTRIBUTES',
        '--segment',
        `${segment}`,
        `--total-segments`,
        `${totalSegments}`,
        '--output',
        'json',
      ])

      const jqProcess = spawn('jq', [
        '-r',
        `def keys: ["PK", "SK", "addressId", "addressObjectId", "avm", "campaignState", "cancellationMotive", "cma", "created", "createdBy", "createdDate", "customerData", "customerStatus", "defaultReportId", "editedBy", "entityType", "hash", "hfa", "invitationId", "isArchived", "isFavorite", "lastModified", "lastReportDate", "lastSeen", "leadQualification", "maintenanceLevel", "modifiedDate", "onBoarded", "previousAdvisor", "propertyInfo", "reopenMotive", "reportId", "reportStatus", "reports", "searchKey", "shortHash", "state", "transferReason"];

        .Items |  
        keys,  
        map([ keys[] as $k | 
          if has($k) then 
            if ($k | IN("created", "createdDate", "lastModified", "lastReportDate")) then  
              (.[$k].S // .[$k].N // "null")  
            elif .[$k].M? then  
              (.[$k].M | tojson)  
            elif .[$k].L? then  
              (.[$k].L | tojson)  
            else 
              (.[$k].S // .[$k].N // .[$k].BOOL // "")  
            end
          else 
            if ($k | IN("created", "createdDate", "lastModified", "lastReportDate")) then 
              "null"  
            else 
              ""  
            end
          end
        ])[] | @csv`,
      ])

      const outputFile = createWriteStream(resultFile)

      awsScan.stdout.pipe(jqProcess.stdin)
      jqProcess.stdout.pipe(outputFile)

      awsScan.stderr.on('data', (data) =>
        console.error(`AWS Scan Error: ${data}`),
      )
      jqProcess.stderr.on('data', (data) => console.error(`jq Error: ${data}`))

      jqProcess.on('close', (code) => {
        if (code === 0) {
          resolve(resultFile)
        } else {
          reject(new Error(`jq process exited with code ${code}`))
        }
      })
    })
  }
}

/**

 aws dynamodb scan \
 --table-name code-kata-dummy-data \
 --profile code_kata \
 --select ALL_ATTRIBUTES \
 --output json | jq -r '.Items'  | jq -r '
 (map(keys) | add | unique) as $keys |
 $keys,
 map([ $keys[] as $k |
 if .[$k] then
 (.[$k].S // .[$k].N // .[$k].BOOL // .[$k].M // .[$k].L // null)
 else
 null
 end | tostring
 ])[] | @csv' > result.csv


 show keys
 cat output.json | jq -r '.Items'  | jq -r 'map(keys) | add | unique | map("\"" + . + "\"") | join(", ")'

 */
