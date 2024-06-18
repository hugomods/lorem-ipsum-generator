#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const { program } = require('commander')
const LoremIpsum = require('lorem-ipsum').LoremIpsum
const randomstring = require('randomstring')
const Mustache = require('mustache')

function getRandomInt (min = 1) {
  return Math.floor(Math.random() * 10) + min
}

const template = `---
date: {{date}}
title: "{{title}}"
description: "{{description}}"
categories:
  {{#categories}}
  - "{{.}}"
  {{/categories}}
tags:
  {{#tags}}
  - "{{.}}"
  {{/tags}}
series:
  {{#series}}
  - "{{.}}"
  {{/series}}
---

{{body}}
`

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
})

program
  .name('lorem-ipsum-generator')
  .requiredOption('-n, --number <number>', 'number of content', parseFloat)
  .option('--paginate <number>', 'how many content per folder', parseFloat, 1000)
  .option('-o, --output <char>', 'output folder', 'content')
  .option('--tag-count <number>', '', parseFloat, 5)
  .option('--category-count <number>', '', parseFloat, 3)
  .option('--series-count <number>', '', parseFloat, 1)

program.parse()

const options = program.opts()
const number = options.number
const paginate = options.paginate
const tagCount = options.tagCount
const categoryCount = options.categoryCount
const seriesCount = options.seriesCount
for (let i = 1; i <= number; i++) {
  const date = (new Date()).toISOString()
  const title = lorem.generateSentences(1)
  const description = lorem.generateSentences(2)
  const tags = []
  for (let ti = 0; ti < tagCount; ti++) {
    tags.push(randomstring.generate(getRandomInt(3)))
  }
  const categories = []
  for (let ci = 0; ci < categoryCount; ci++) {
    categories.push(randomstring.generate(getRandomInt(3)))
  }
  const series = []
  for (let si = 0; si < seriesCount; si++) {
    series.push(randomstring.generate(getRandomInt(3)))
  }
  let body = ''
  for (let bi = 0; bi < getRandomInt(5); bi++) {
    body += `
## ${lorem.generateWords(3)}

${lorem.generateParagraphs(3)}
`
  }
  const content = Mustache.render(template, {
    date,
    title,
    description,
    body,
    tags,
    categories,
    series
  })
  const page = Math.ceil(i / paginate)
  const subfolder = `${(page - 1) * paginate + 1}-${page * paginate}`
  const file = path.join(options.output, subfolder, `${(i - 1) % paginate + 1}.md`)
  const dir = path.dirname(file)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
      mode: 0o744
    })
  }
  fs.writeFile(file, content, err => {
    if (err) {
      console.error(err)
    }
  })
}
