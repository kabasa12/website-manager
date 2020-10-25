var express = require('express');
var router = express.Router();
const userModal = require('../models/userModal');
const movieModal = require('../models/movieModal');
const { body, validationResult } = require('express-validator');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Movies Management' });
});

router.get('/users', async function(req, res, next) {
  let appSession = req.session;
  if(appSession.isAuth && appSession.isAdmin) {
    let users = await userModal.getUsersData();
    res.render('userManagementPage', { ...users});
  } else {
    res.redirect('/login');
  }
});

router.get('/login',function(req, res, next) {
    res.render('loginPage',{});
});

router.get('/addUser',function(req, res, next) {
  let appSession = req.session
  if(appSession.isAuth && appSession.isAdmin) {
    res.render('userDataPage',{});
  } else {
    res.redirect('/login');
  }
});

router.post('/addUser', [body('userName').not().isEmpty(), body('password').not().isEmpty(),
      body('createdDate').not().isEmpty(), body('numOfTransaction').not().isEmpty()],
      async function(req, res, next) {

  let appSession = req.session
  if(appSession.isAuth && appSession.isAdmin) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('error', "Please fill all the fields");
      res.locals.message = req.flash();
      res.render('userDataPage',{message:res.locals.message})
    }
    else {
      let resp = await userModal.addNewUser(req.body);

      if(resp == "Success")
        res.redirect('/users');
    }
  } else {
    res.redirect('/login');
  }
});

router.get('/deleteUser',async function(req, res, next) {
  let appSession = req.session
  if(appSession.isAuth && appSession.isAdmin) {
    let resp = await userModal.deleteUser(req.query.id);
    if(resp == "Success")
      res.redirect('/users');
  } else {
    res.redirect('/login');
  }
});

router.get('/updateUser',async function(req, res, next) {
  let appSession = req.session
  if(appSession.isAuth && appSession.isAdmin) {
    let user = await userModal.getUsersDataById(req.query.id)
    res.render('userDataPage',{user:user});
  } else {
    res.redirect('/login');
  }
});


router.post('/updateUser', [body('userName').not().isEmpty(), body('password').not().isEmpty()],async function(req, res, next) {
  let appSession = req.session
  if(appSession.isAuth && appSession.isAdmin) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('error', "Please fill email and password");
      res.locals.message = req.flash();
      res.render('userDataPage',{message:res.locals.message})
    }
    else {
      let resp = await userModal.updateUser(req.body);

      if(resp == "Success")
        res.redirect('/users');
    }
  } else {
    res.redirect('/login');
  }
});

router.get('/menuPage',function(req, res, next) {
  let appSession = req.session;
  if(appSession.isAuth) {
    res.render('menuPage',{isAdmin:appSession.isAdmin});
  } else {
    res.redirect('/login');
  }
});

router.post('/menuPage',[body('userName').not().isEmpty(), body('password').not().isEmpty()], async function(req, res, next) {
  let appSession = req.session
  
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('error', "Please fill email and password");
    res.locals.message = req.flash();
    res.render('loginPage',{message:res.locals.message})
  }
  else {
    let currentUser = await userModal.validUser(req.body);
    
    let moviesData = await movieModal.getAllMovies();

    if (currentUser.id > -1){
      
      if(appSession.counter)
      {
        appSession.counter += 1;
        appSession.isAdmin = currentUser.isAdmin;
        appSession.numOfTransaction = currentUser.numOfTransaction;
      }
      else
      {
        appSession = userModal.restartSession(appSession);
        appSession.isAdmin = currentUser.isAdmin;
        appSession.numOfTransaction = currentUser.numOfTransaction;
        appSession.isAuth = true;
        appSession.movies = moviesData.data;
        appSession.maxMovieId = moviesData.maxMovieId;
      }

      let isAllow = userModal.validUserCredit(
                                          appSession.counter,
                                          appSession.loginDate,
                                          appSession.numOfTransaction,
                                          appSession.isAdmin);
      
      if(isAllow == "Success"){
          res.render('menuPage',{isAdmin:appSession.isAdmin});
      } else {
        appSession = userModal.restartSession(appSession);
      }
      
    } else {
        req.flash('error', "Incorrect userName or password");
        res.locals.message = req.flash();
        res.render('loginPage',{message:res.locals.message})
      }
    }  
  
  
});
module.exports = router;
