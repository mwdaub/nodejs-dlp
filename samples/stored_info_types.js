/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function createStoredInfoTypeFromGcsFiles(
  callingProjectId,
  gcsInputFilePath,
  gcsOutputPath,
  storedInfoTypeId,
  displayName,
  description
) {
  // [START dlp_create_stored_info_type_from_gcs_files]

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The GCS path of the files containing the dictionary words.
  // const gcsInputFilePath = 'gs://YOUR-BUCKET/words.txt';

  // The GCS path to store the output files.
  // const bucketName = 'gs://YOUR-BUCKET/';

  // (Optional) The name of the stored infoType to be created.
  // const storedInfoTypeId = 'my-stored-info-type';

  // (Optional) A display name for the stored infoType to be created
  // const displayName = 'My stored infoType';

  // (Optional) A description for the stored infoType to be created
  // const description = "This is a sample stored infoType.";

  // Construct the dictionary config.
  const dictionaryConfig = {
    outputPath: {
      path: gcsOutputPath,
    },
    cloudStorageFileSet: {
      url: gcsInputFilePath,
    },
  };
  createStoredInfoType(
    callingProjectId,
    dictionaryConfig,
    storedInfoTypeId,
    displayName,
    description
  );
  // [END dlp_create_stored_info_type_from_gcs_files]
}

async function createStoredInfoTypeFromBigQueryTable(
  callingProjectId,
  bqInputProjectId,
  bqInputDatasetId,
  bqInputTableId,
  bqInputTableField,
  gcsOutputPath,
  storedInfoTypeId,
  displayName,
  description
) {
  // [START dlp_create_stored_info_type_from_bq_table]

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The project ID of the BigQuery table containing the dictionary words
  // const bqInputProjectId = 'my-project';

  // The dataset ID of the BigQuery table containing the dictionary words
  // const bqInputDatasetId = 'my_dataset';

  // The table ID of the BigQuery table containing the dictionary words
  // const bqInputTableId = 'my_table';

  // The field of the BigQuery table containing the dictionary words
  // const bqInputTableField = 'words';

  // The GCS path to store the output files.
  // const bucketName = 'gs://YOUR-BUCKET/';

  // (Optional) The name of the stored infoType to be created.
  // const storedInfoTypeId = 'my-stored-info-type';

  // (Optional) A display name for the stored infoType to be created
  // const displayName = 'My stored infoType';

  // (Optional) A description for the stored infoType to be created
  // const description = "This is a sample stored infoType.";

  // Construct the dictionary config.
  const dictionaryConfig = {
    outputPath: {
      path: gcsOutputPath,
    },
    bigQueryField: {
      table: {
        projectId: bqInputProjectId,
        datasetId: bqInputDatasetId,
        tableId: bqInputTableId,
      },
      field: {name: bqInputTableField},
    },
  };
  createStoredInfoType(
    callingProjectId,
    dictionaryConfig,
    storedInfoTypeId,
    displayName,
    description
  );
  // [END dlp_create_stored_info_type_from_bq_table]
}

async function createStoredInfoType(
  callingProjectId,
  dictionaryConfig,
  storedInfoTypeId,
  displayName,
  description
) {
  // [START dlp_create_stored_info_type]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The dictionary config for the stored infoType.
  //  const dictionaryConfig = {
  //    outputPath: {
  //      path: `gs://YOUR-BUCKET/words.txt`,
  //    },
  //    cloudStorageFileSet: {
  //      url: `gs://YOUR-BUCKET/`,
  //    },
  //  };

  // (Optional) The name of the stored infoType to be created.
  // const storedInfoTypeId = 'my-stored-info-type';

  // (Optional) A display name for the stored infoType to be created
  // const displayName = 'My stored infoType';

  // (Optional) A description for the stored infoType to be created
  // const description = "This is a sample stored infoType.";

  // Construct stored infoType config.
  const config = {
    displayName: displayName,
    description: description,
    largeCustomDictionary: dictionaryConfig,
  };

  // Construct stored infoType creation request
  const request = {
    parent: dlp.projectPath(callingProjectId),
    config: config,
    storedInfoTypeId: storedInfoTypeId,
  };

  try {
    // Run stored infoType creation request
    const [storedInfoType] = await dlp.createStoredInfoType(request);
    console.log(`Successfully created stored infoType ${storedInfoType.name}.`);
  } catch (err) {
    console.log(`Error in createStoredInfoType: ${err.message || err}`);
  }

  // [END dlp_create_stored_info_type]
}

async function listStoredInfoTypes(callingProjectId) {
  // [START dlp_list_stored_info_types]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // Construct storedInfoType listing request
  const request = {
    parent: dlp.projectPath(callingProjectId),
  };

  // Helper function to pretty-print dates
  const formatDate = date => {
    const msSinceEpoch = parseInt(date.seconds, 10) * 1000;
    return new Date(msSinceEpoch).toLocaleString('en-US');
  };

  try {
    // Run stored infoType listing request
    const [storedInfoTypes] = await dlp.listStoredInfoTypes(request);
    storedInfoTypes.forEach(storedInfoType => {
      // Log stored infoType details
      console.log(`Stored infoType: ${storedInfoType.name}:`);
      if (storedInfoType.currentVersion) {
        const version = storedInfoType.currentVersion;
        console.log(`Current version:`);
        console.log(`  Created: ${formatDate(version.createTime)}`);
        console.log(`  State: ${version.state}`);
        console.log(`  Error count: ${version.errors.length}`);
      }
      if (storedInfoType.pendingVersions.length > 0) {
        console.log(`Pending versions:`);
        storedInfoType.pendingVersions.forEach(version => {
          console.log(`  Created: ${formatDate(version.createTime)}`);
          console.log(`  State: ${version.state}`);
          console.log(`  Error count: ${version.errors.length}`);
        });
      }
    });
  } catch (err) {
    console.log(`Error in listStoredInfoTypes: ${err.message || err}`);
  }
  // [END dlp_list_stored_info_types]
}

async function deleteStoredInfoType(storedInfoTypeId) {
  // [START dlp_delete_stored_info_type]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The name of the stored infoType to be deleted
  // Parent project ID is automatically extracted from this parameter
  // const storedInfoTypeId = 'projects/my-project/storedInfoTypes/my-stored-info-type';

  // Construct stored infoType deletion request
  const request = {
    name: storedInfoTypeId,
  };
  try {
    // Run stored infoType deletion request
    await dlp.deleteStoredInfoType(request);
    console.log(`Successfully deleted stored infoType ${storedInfoTypeId}.`);
  } catch (err) {
    console.log(`Error in deleteStoredInfoType: ${err.message || err}`);
  }

  // [END dlp_delete_stored_info_type]
}

const cli = require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `create`,
    `Create a Data Loss Prevention API stored infoType.`,
    {
      gcsInputFilePath: {
        alias: 'i',
        default: '',
        type: 'string',
      },
      bqInputProjectId: {
        alias: 'p',
        default: process.env.GCLOUD_PROJECT || '',
        type: 'string',
      },
      bqInputDatasetId: {
        alias: 'd',
        default: '',
        type: 'string',
      },
      bqInputTableId: {
        alias: 't',
        default: '',
        type: 'string',
      },
      bqInputTableField: {
        alias: 'f',
        default: '',
        type: 'string',
      },
      gcsOutputPath: {
        alias: 'o',
        default: '',
        type: 'string',
      },
      storedInfoTypeId: {
        alias: 'n',
        default: '',
        type: 'string',
      },
      displayName: {
        alias: 's',
        default: '',
        type: 'string',
      },
      description: {
        alias: 'c',
        default: '',
        type: 'string',
      },
    },
    opts => {
      if (opts.gcsInputFilePath) {
        createStoredInfoTypeFromGcsFiles(
          opts.callingProjectId,
          opts.gcsInputFilePath,
          opts.gcsOutputPath,
          opts.storedInfoTypeId,
          opts.displayName,
          opts.description
        );
      } else {
        createStoredInfoTypeFromBigQueryTable(
          opts.callingProjectId,
          opts.bqInputProjectId,
          opts.bqInputDatasetId,
          opts.bqInputTableId,
          opts.bqInputTableField,
          opts.gcsOutputPath,
          opts.storedInfoTypeId,
          opts.displayName,
          opts.description
        );
      }
    }
  )
  .command(`list`, `List Data Loss Prevention API stored infoTypes.`, {}, opts =>
    listStoredInfoTypes(opts.callingProjectId)
  )
  .command(
    `delete <storedInfoTypeId>`,
    `Delete a Data Loss Prevention API stored infoType.`,
    {},
    opts => deleteStoredInfoType(opts.storedInfoTypeId)
  )
  .option('c', {
    type: 'string',
    alias: 'callingProjectId',
    default: process.env.GCLOUD_PROJECT || '',
  })
  .example(`node $0 create -i gs://my-bucket/words.txt -o gs://my-bucket/`)
  .example(`node $0 list`)
  .example(`node $0 delete projects/my-project/storedInfoTypes/my-stored-info-type`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/dlp/docs.`);

if (module === require.main) {
  cli.help().strict().argv; // eslint-disable-line
}
