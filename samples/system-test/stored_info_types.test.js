/**
 * Copyright 2018, Google, Inc.
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
const path = require('path');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const uuid = require('uuid');

const projectId = process.env.GCLOUD_PROJECT;
const cmd = 'node stored_info_types.js';
const cwd = path.join(__dirname, '..');
const storedInfoTypeName = `my-stored-info-type-${uuid.v4()}`;
const fullStoredInfoTypeName = `projects/${projectId}/storedInfoTypes/${storedInfoTypeName}`;
const storedInfoTypeDisplayName = `My stored infoType display name: ${uuid.v4()}`;

const bucketName = process.env.BUCKET_NAME;

it('should create a stored infoType', async () => {
  const output = await tools.runAsync(
    `${cmd} create -i gs://${bucketName}/dictionary.txt -o gs://${bucketName}/ \
    -n ${storedInfoTypeName}`,
    cwd
  );
  assert.strictEqual(
    output.includes(`Successfully created stored infoType ${fullStoredInfoTypeName}`),
    true
  );
});

it('should list stored infoTypes', async () => {
  const output = await tools.runAsync(`${cmd} list`, cwd);
  assert.strictEqual(output.includes(`Stored infoType: ${fullStoredInfoTypeName}`), true);
  assert.strictEqual(
    new RegExp(/Created: \d{1,2}\/\d{1,2}\/\d{4}/).test(output),
    true
  );
  assert.strictEqual(new RegExp(/State: (PENDING|READY)/).test(output), true);
  assert.strictEqual(new RegExp(/Error count: 0/).test(output), true);
});

it('should delete a stored infoType', async () => {
  const output = await tools.runAsync(`${cmd} delete ${fullStoredInfoTypeName}`, cwd);
  assert.strictEqual(
    output.includes(`Successfully deleted stored infoType ${fullStoredInfoTypeName}.`),
    true
  );
});

it('should handle stored infoType creation errors', async () => {
  const output = await tools.runAsync(
    `${cmd} create -i gs://${bucketName}/dictionary.txt -o gs://${bucketName}/ -n "@@@@@"`,
    cwd
  );
  assert.strictEqual(new RegExp(/Error in createStoredInfoType/).test(output), true);
});

it('should handle stored infoType deletion errors', async () => {
  const output = await tools.runAsync(`${cmd} delete bad-stored-info-type-path`, cwd);
  assert.strictEqual(new RegExp(/Error in deleteStoredInfoType/).test(output), true);
});
