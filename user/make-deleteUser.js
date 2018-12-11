module.exports = ({ createError, ObjectID, getDb, gt }) => async (req, res, next) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(422).send({
      errors: [{
        location: 'params',
        param: 'id',
        value: req.params.id,
        msg: gt.gettext('Invalid user ID')
      }]
    })
  }

  const _id = new ObjectID(req.params.id)
  const db = await getDb()
  const usersCollection = db.collection('users')
  const user = await usersCollection.findOne({ _id })
  const currentUser = req.session.user

  if (!user) {
    return next(createError(404, gt.gettext('User not found')))
  }

  if (currentUser.role !== 'master') {
    return next(createError(401, gt.gettext('Only a master user can delete a user')))
  }

  const projectsCollection = db.collection('projects')
  const projects = await projectsCollection.find({
    'people._id': _id
  }).toArray()

  projects.forEach(async project => {
    const people = project.people.reduce((res, person) => {
      if (person._id.equals(_id)) {
        return res
      }

      return res.concat([person])
    }, [])

    if (people.length) {
      if (project.budget) {
        const budgetPerPerson = project.budget / people.length
        const budgetPerPersonInt = Math.floor(budgetPerPerson)

        people.forEach(person => person.budget = budgetPerPerson)

        if (budgetPerPersonInt < budgetPerPerson) {
          people[0].budget++
        }
      }

      await projectsCollection.updateOne({ _id: project._id }, {
        $set: { people }
      })
    } else {
      await projectsCollection.deleteOne({ _id: project._id })

      const categoriesCollection = db.collection('categories')
      const categories = await categoriesCollection.find({
        'terms.projects': project._id
      }).toArray()

      categories.forEach(async category => {
        category.terms.forEach(term => {
          if (!term.projects.find(_id => _id.equals(project._id))) {
            return
          }

          term.projects = term.projects.reduce((res, _id) => {
            if (_id.equals(project._id)) {
              return res
            }

            return res.concat([_id])
          }, [])
        })

        await categoriesCollection.updateOne({ _id: category._id }, {
          $set: { terms: category.terms }
        })
      })
    }
  })

  await db.collection('activities').deleteMany({ recipient: _id })
  await db.collection('activities').updateMany({
    people: _id
  }, {
    $pull: {
      people: _id
    }
  })

  await usersCollection.deleteOne({ _id })

  res.end()
}
