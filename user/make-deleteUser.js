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
  const user = await db.collection('users').findOne({ _id })
  const currentUser = req.session.user

  if (!user) {
    return next(createError(404, gt.gettext('User not found')))
  }

  if (currentUser.role !== 'master') {
    return next(createError(401, gt.gettext('Only a master user can delete a user')))
  }

  const projects = await db.collection('projects').find({
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
        const intBudgetPerPerson = Math.floor(budgetPerPerson)

        people.forEach(person => person.budget = budgetPerPerson)

        if (intBudgetPerPerson !== budgetPerPerson) {
          people[0].budget = Math.abs(intBudgetPerPerson * (people.length - 1) - project.budget)
        }
      }

      await db.collection('projects').updateOne({ _id: project._id }, {
        $set: { people }
      })
    } else {
      await db.collection('projects').deleteOne({ _id: project._id })
      await db.collection('messages').deleteMany({ project: project._id })

      const categories = await db.collection('categories').find({
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

        await db.collection('categories').updateOne({ _id: category._id }, {
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

  await db.collection('users').deleteOne({ _id })
  await db.collection('messages').deleteMany({ from: _id })

  res.end()
}
