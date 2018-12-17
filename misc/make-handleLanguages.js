module.exports = ({ fs, path, Gettext, mo, langs }) => {
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

  return (req, res, next) => {
    if (req.session.user && req.session.user.lang) {
      global.gt.setLocale(req.session.user.lang)
    }

    return next()
  }
}
