module.exports = ({ Gettext, langs, path, fs, mo }) => {
  if (!global.gt) {
    global.gt = new Gettext()

    langs.forEach(lang => {
      const filePath = path.resolve(__dirname, '../languages', `${lang}.mo`)

      if (!fs.existsSync(filePath)) {
        return
      }

      const translation = fs.readFileSync(filePath)
      const parsedTranslation = mo.parse(translation)

      global.gt.addTranslations(lang, 'premura', parsedTranslation)
    })

    global.gt.setTextDomain('premura')
  }

  return global.gt
}
