// Copyright © 2022 Relay Inc.

import { statSync, readdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import got from 'got'

let [auth, category] = process.argv.slice(2)

auth = auth ?? process.env.README_TOKEN
category = category ?? process.env.README_CATEGORY

if (!(auth && category)) {
  console.log(`Must provide "auth" and "category" as CLI args or ENV variables`)
  process.exit(1)
}

const __dirname = dirname(new URL(import.meta.url).pathname)


const getAllFiles = (dir, files=[]) => {
  const currentFiles = readdirSync(dir)
  currentFiles.forEach(file => {
    const relativePath = join(dir, `/`, file)
    if (statSync(relativePath).isDirectory()) {
      files = getAllFiles(relativePath, files)
    } else {
      if (file.endsWith(`.md`)) {
        files.push(join(__dirname, `..`, relativePath))
      }
    }
  })
  return files
}

const docs = getAllFiles(`./concat-docs`)

for (const doc of docs) {
  console.log(`Uploading ${doc}`)
  const docContent = readFileSync(doc)

  await got.post(`https://dash.readme.io/api/v1/docs`, {
    responseType: `json`,
    headers: {
      [`x-readme-version`]: `1.0.1`,
    },
    username: auth,
    password: ``,
    json: {
      title: `Relay JS SDK`,
      category,
      hidden: true,
      order: 999,
      body: docContent.toString(),
    }
  })
}
