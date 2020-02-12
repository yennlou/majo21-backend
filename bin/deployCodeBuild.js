/* eslint-disable no-unused-expressions */
const path = require('path')
const yargs = require('yargs')
const dotenv = require('dotenv')
const AWS = require('aws-sdk')

AWS.config.update({ region: 'ap-southeast-2' })
const cloudformation = new AWS.CloudFormation()

const makeParams = (stage = 'beta') => {
  const envFile = stage === 'prod' ? '.env.prod' : '.env'
  const { GITHUB_BRANCH, GITHUB_TOKEN, GITHUB_WEBHOOK_SECRET } = dotenv.config({
    path: path.join(__dirname, `../${envFile}`)
  }).parsed

  const parameters = { GITHUB_BRANCH, GITHUB_TOKEN, GITHUB_WEBHOOK_SECRET }

  const templateUrl = 'file://' + path.join(__dirname, 'codeBuildStack.yml')

  const params = {
    StackName: `majo21-backend-cicd-${stage}`,
    Capabilities: ['CAPABILITY_IAM'],
    Parameters: Object.keys(parameters).map(key => ({
      ParameterKey: key,
      ParameterValue: parameters[key]
    })),
    TemplateBody: templateUrl
  }
  console.log(params)
  return params
}

yargs
  .command(
    'create-stack',
    'create cicd stack',
    (yargs) => {},
    ({ stage }) => {
      console.log(`create stack:${stage}`)
      cloudformation.createStack(makeParams(stage), (err, data) => {
        if (err) console.log(err, err.stack)
        else console.log(data)
      })
    })
  .command(
    'update-stack',
    'update cicd stack',
    (yargs) => {},
    ({ stage }) => {
      console.log(`update stack:${stage}`)
      cloudformation.updateStack(makeParams(stage), (err, data) => {
        if (err) console.log(err, err.stack)
        else console.log(data)
      })
    })
  .option('stage', {
    alias: 's',
    type: 'string',
    default: 'beta'
  })
  .help()
  .argv
