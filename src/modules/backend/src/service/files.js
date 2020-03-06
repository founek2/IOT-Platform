import fs from 'fs'
import path from 'path'
import { IMAGES_DEVICES_FOLDER } from '../constants'
import {devLog} from 'framework/src/Logger'

const imgExtensions = ['png', 'jpg', 'jpeg']

export function saveImageBase64(base64Data, fileName, ext) {
     return new Promise((resolve, reject) => {
          if (!imgExtensions.some(ex => ex === ext)) reject('notAllowedExtension')
          else {
               const data = base64Data.replace(/^data:image\/\w+;base64,/, '')
               devLog("saving file to", path.join(process.env.IOT_IMAGES_PATH, fileName + "." + ext))
               fs.writeFile(path.join(process.env.IOT_IMAGES_PATH, IMAGES_DEVICES_FOLDER, fileName + "." + ext), data, 'base64', function (err) {
                    console.log(err)
                    if (err) reject(err)
                    resolve()
               })
          }
     })
}

export function deleteImage(fileName) {
     return new Promise((resolve, reject) => {
          console.log(fileName, process.env.IOT_IMAGES_PATH, IMAGES_DEVICES_FOLDER)
          devLog("removing file from", path.join(process.env.IOT_IMAGES_PATH, IMAGES_DEVICES_FOLDER, fileName))
          fs.unlink(path.join(process.env.IOT_IMAGES_PATH, fileName), err => {
               if (err) reject(err)
               resolve()
          })
     })
}

export function validateFileExtension(ext) {
     return imgExtensions.some(ex => ex === ext)
}