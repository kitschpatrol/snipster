const child_process = require('child_process')
const exec = require('child_process').exec
const inquirer = require('inquirer')
const publish = require('./publish')
const questions = require('../utils/questions')
const { log, read, write, home, fail } = require('../utils/general')
const { SNIPSTER_CONFIG } = require('../utils/constants')

const add = async () => {
  const settings = await read(SNIPSTER_CONFIG)
  let filename, prefix, lang
  if (process.argv.length > 3) {
    filename = process.argv[3]
    prefix = filename.split('.')[0]
    lang = filename.split('.')[1]
  } else {
    log('\n✂️  Add a snippet:')
    const question1 = await inquirer.prompt(questions.add)
    filename = `${question1.prefix}.${question1.langs}`
  }

  const editor = process.env.EDITOR || 'vi'
  const child = child_process.spawn(editor, [`/tmp/${filename}`], {
    stdio: 'inherit'
  })
  child.on('exit', async function (e, code) {
    if (e) { fail(e) }
    const contents = await read(`/tmp/${filename}`)
    const file = await write(`${settings.directory}/added/${filename}`, contents)
    const published = await publish()
    const question2 = await inquirer.prompt(questions.more)
      if (!question2.more) {
        log('Okay, exiting...')
        return
      }
      add()
  })
}

module.exports = add