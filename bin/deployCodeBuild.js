/* eslint-disable no-unused-expressions */
const path = require('path')
const fs = require('fs')
const yargs = require('yargs')
const dotenv = require('dotenv')
const AWS = require('aws-sdk')

AWS.config.update({ region: 'ap-southeast-2' })
const cloudformation = new AWS.CloudFormation()
const TemplateBody = fs.readFileSync(path.join(__dirname, './codeBuildStack.yml')).toString()

const makeParams = (stage = 'beta') => {
  const envFile = stage === 'prod' ? '.env.prod' : '.env'
  const {
    GITHUB_BRANCH: GithubBranch,
    GITHUB_TOKEN: GithubToken,
    GITHUB_WEBHOOK_SECRET: GithubWebhookSecret
  } = dotenv.config({
    path: path.join(__dirname, `../${envFile}`)
  }).parsed

  const parameters = { GithubBranch, GithubToken, GithubWebhookSecret }

  const params = {
    StackName: `majo21-backend-cicd-${stage}`,
    Capabilities: ['CAPABILITY_IAM'],
    Parameters: Object.keys(parameters).map(key => ({
      ParameterKey: key,
      ParameterValue: parameters[key]
    })),
    TemplateBody
  }
  return params
}

yargs
  .command(
    'create-stack',
    'create cicd stack',
    (yargs) => {},
    ({ stage }) => {
      console.log(`Start creating stack-${stage}...`)
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
      console.log(`Start updating stack-${stage}...`)
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
