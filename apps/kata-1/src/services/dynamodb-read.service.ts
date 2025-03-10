import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import {
  ChildProcessWithoutNullStreams,
  SpawnOptionsWithoutStdio,
  spawn,
} from 'node:child_process';
import {
  ConsoleLogger,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IReadStreamService } from '../interfaces';

function spawnWrapper(
  command: string,
  args?: readonly string[],
  opts?: SpawnOptionsWithoutStdio,
): ChildProcessWithoutNullStreams {
  const options = opts ?? { env: { ...process.env } };
  const childProcess = spawn(command, args, options);
  childProcess.stderr.on('data', (data) =>
    console.error(`Child process error for command ${command}: ${data}`),
  );

  return childProcess;
}

function getFileName(segment: number): string {
  return `./result-program${segment}.csv`;
}

@Injectable()
export class DynamodbReadService implements IReadStreamService {
  constructor(
    private readonly config: ConfigService,
    @Inject(ConsoleLogger) private readonly logger: LoggerService,
  ) {}

  async read(
    segment: number = 0,
    totalSegments: number = 1,
  ): Promise<Readable> {
    this.logger.log(`Scanning segment ${segment} of ${totalSegments}`);
    const fileName = getFileName(segment);
    await this.scanAndSaveFile(fileName, segment, totalSegments);
    this.logger.debug(
      `Reading file ${fileName} of segment ${segment} of ${totalSegments}`,
    );

    return createReadStream(fileName, { highWaterMark: 1 });
  }

  async scanAndSaveFile(
    fileName: string,
    segment: number,
    totalSegments: number,
  ): Promise<void> {
    const tableName = this.config.get<string>('dynamodb.tableName');
    const awsScan = this.spawnScan(tableName, segment, totalSegments);
    const jqProcess = this.spawnJq();
    const outputFile = createWriteStream(fileName);

    await Promise.all([
      pipeline(awsScan.stdout, jqProcess.stdin),
      pipeline(jqProcess.stdout, outputFile),
    ]);
  }

  spawnScan(
    tableName: string,
    segment: number,
    totalSegments: number,
  ): ChildProcessWithoutNullStreams {
    const useFile = this.config.get<boolean>('dynamodb.useExistingFile');
    if (useFile) {
      return spawnWrapper('cat', [`output-${segment}.json`]);
    }

    return spawnWrapper('aws', [
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
    ]);
  }

  spawnJq(): ChildProcessWithoutNullStreams {
    return spawnWrapper('jq', [
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
    ]);
  }
}

/**

 aws dynamodb scan \
 --table-name code-kata-dummy-data \
 --profile code_kata \
 --select ALL_ATTRIBUTES \
 --segment 0 \
 --totalSegments 4
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
