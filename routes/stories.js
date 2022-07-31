const express = require('express')
const router = express.Router()
const { ensureAuth} = require('../middleware/auth')
const Event = require('../models/Event')

// @desc     Show/ add page
// @route    GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('stories/add')
})

// @desc     process the add form
// @route    POST /stories
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Event.create(req.body)
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

// @desc     Show all stories
// @route    GET /stories
router.get('/', ensureAuth, async (req, res) => {
    try {
        const events = await Event.find({ status: 'public'})
            .populate('user')//
            .sort({createdAt: 'desc'})
            .lean()

       res.render('stories/index', {
        events,
       }) 
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

// @desc     Show edit page
// @route    GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    const event = await Event.findOne({_id: req.params.id}).lean()

    // check to see if the event is there
    if(!event) {
        return res.render('error/404')
    }

    // redirect if not the event owner
    if(event.user != req.user.id) {
        res.redirect('/stories')
    } else {
        res.render('stories/edit', {
            event,
        })
    }
})

// @desc     update event
// @route    PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
    let event = await Event.findById(req.params.id).lean()

    if (!event) {
        return res.render('error/404')
    }

    if(event.user != req.user.id) {
        res.redirect('/stories')
    } else {
            event = await Event.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true //this makes sure the mongoose fields are valid
            })

        res.redirect('/')
    }
})







module.exports = router