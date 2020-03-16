const express = require('express')
const knex = require('./db/knex.js')
const app = express()
app.use(express.json())
app.get('/api', (req, res) => {
    res.send('Willkommen im OpenProject Dashboard-API')
})
//Students
//Get Students
app.get('/api/students/:class', async (req, res) => {
    let results = await knex('students')
        .where('classes_id', req.params.class)
        .orderBy('surname', 'asc')
        .select('idstudents', 'prename', 'surname')
    res.json(results)
    console.log("get students")
})

//Delete Students
app.delete('/api/students/:studentid', async (req, res) => {
    let results = await knex('students')
        .where('idstudents', req.params.studentid)
        .del()
    res.json(results)
    console.log("delete a student")
})

//Post Students
app.post('/api/students', async (req, res) => {
    let results = await knex('students')
        .insert({
            "surname": req.body.surname,
            "prename": req.body.prename,
            "classes_id": req.body.classes_id,
        })
    res.json(results)
    console.log("posting a student")
})

//Classes
//Get classes
app.get('/api/classes', async (req, res) => {
    let results = await knex('classes')
        .select('*')
    res.json(results)
    console.log("get classes")
})

//Rooms
//Get rooms
app.get('/api/rooms', async (req, res) => {
    let results = await knex('rooms')
        .select('*')
    res.json(results)
    console.log("get rooms")
})

//Subjects
//Get subjects
app.get('/api/subjects', async (req, res) => {
    let results = await knex('subjects')
        .select('*')
    res.json(results)
    console.log("get subjects")
})

//Timetables
//Get timetables by class
app.get('/api/timetables/:class', async (req, res) => {
    let results = await knex('timetables')
        .where('classes_id', req.params.class)
        .join('subjects', { 'subjects_id': 'idsubjects' })
        .orderBy('day', 'asc')
        .select('idtimetable', 'day', 'start', 'end', 'subject', 'classes_id')
    res.json(results)
    console.log("get timetable by class")
})

//Get timetables by day
app.get('/api/timetables/day/:day', async (req, res) => {
    let results = await knex('timetables')
        .where('day', req.params.day)
        .join('subjects', { 'subjects_id': 'idsubjects' })
        .join('classes', { 'classes_id': 'idclasses' })
        .orderBy('day', 'asc')
        .select('day', 'start', 'end', 'subject', 'classes_id', 'rooms_id')
    res.json(results)
    console.log("get timetable - day" + JSON.stringify(req.body))
})

//Delete timetable entry
app.delete('/api/timetables/:id', async (req, res) => {
    let results = await knex('timetables')
        .where('idtimetable', req.params.id)
        .del()
    res.json(results)
    console.log("delete entry in timetable")
})

//Post timetable entry
app.post('/api/timetables', async (req, res) => {
    let results = await knex('timetables')
        .insert({
            "day": req.body.day,
            "start": req.body.start,
            "end": req.body.end,
            "classes_id": req.body.classes_id,
            "subjects_id": req.body.subjects_id,
        })
    res.json(results)
    console.log("post entry into timetable")
})

//Login
//Get logins
app.get('/api/login', async (req, res) => {
    let results = await knex('login')
        .select('*')
    res.json(results)
    console.log("get login")
})

//API tester
app.listen(3000, () => console.log("Listening on port 3000"))
