const fs          = require('fs');
const path        = require('path');
const config      = require('./config.json');
const logger      = require('./util/logger.js');
const Collection  = require('./structure/Collection.js');
const Command     = require('./structure/Command.js');
const Eris        = require('eris');
const rethink     = require('rethinkdbdash');

const session     = require('express-session');
const express     = require('express');
const app         = express();

const passport    = require('passport')
const DiscordStrategy = require('passport-discord').Strategy;
// , 'email', 'guilds', 'guilds.join'
const scopes = ['identify'];

const CLIENT_ID = config.CLIENT_ID;
const CLIENT_SECRET = config.CLIENT_SECRET;
const CALLBACK_URL = config.CALLBACK_URL;

const got = require('got');

passport.use(new DiscordStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: scopes
},
function(accessToken, refreshToken, profile, cb) {
    process.nextTick(function() {
      return cb(null, profile);
    });
}));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(passport.initialize());

app.use(passport.session());

app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));

app.get('/', passport.authenticate('discord', { scope: scopes }), function (req, res) { });

app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/tickets') } // auth success
);

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/tickets', checkAuth, function (req, res) {
  let userID = req.user.id;
  var userRole;
  r.table('users').get(userID).run((err, callback) => {
    if (callback !== null) userRole = callback.role; else userRole = 'USER';
    if (userRole === "SUPPORT") {
      r.table('tickets').orderBy('case').run((err, callback) => {
        res.render('info', { callback })
      });
    } else if(userRole === "USER"){
      r.table('tickets').getAll(userID, { index: 'user' }).orderBy('case').run((err, callback) => {
        res.render('info', { callback })
      });
    } else {
      res.send('User Role not found' + userRole);
    }
  });
});

app.get('/ticket/:ticketID', checkAuth, async function (req, res) {
  var ticket, chatlog;
  var avatars = [];
  r.table('tickets').get(req.params.ticketID).run((err, callback) => {
    if (callback.name !== undefined) ticketName = '#' + callback.case + ' - ' + escapeHtml(callback.name); else ticketName = '#' + callback.case;
    ticket = callback;
  });
  r.table('chatlogs').get(req.params.ticketID).run(async (err, callback) => {
    chatlog = callback;
    for (var i = chatlog.logs.length - 1; i >= 0; i--) {
      let userID = chatlog.logs[i].id
      if(typeof avatars[userID] == "undefined"){
        try {
          const data = await got(`https://discord.com/api/users/${chatlog.id}`, {
            responseType: 'json',
            headers: {
              "Authorization": `Bot ${config.token}`
            }
          }
          );
          avatars[userID] = data.body.avatar;
        } catch (error) {
          avatars[userID] = 'error';
          console.log(error.response.body);
          //=> 'Internal server error ...'
        }
      }
    }

    res.render('ticket', {
      title: `Ticket ${ticketName}`,
        ticket,
        chatlog,
        avatars
    });
  });
});

app.get('/t/:secret', (req, res) => {
  if (!req.params.secret || req.params.secret === undefined) return res.send('Invalid secret');
  var ticket, chatlog;
  r.table('chatlogs').getAll(req.params.secret, { index: 'secret' }).run((err, callback) => {
    if (callback[0] === undefined) return res.send('Invalid secret');
    callback = callback[0];
    chatlog = callback;
    // // console.log(callback.id);
    r.table('tickets').get(callback.id).run((err, cb) => {
      // // console.log(cb);
      if (cb.name !== undefined) ticketName = '#' + cb.case + ' - ' + escapeHtml(cb.name); else ticketName = '#' + cb.case;
      ticket = cb;
      res.render('ticket', {
        title: `Ticket ${ticketName}`,
          ticket,
          chatlog
      });
    });
  });
});

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

let r = rethink({
  db: 'ticketbot',
  host: '91.121.171.170',
  password: config.password
});

require('./functions/initDatabase.js')(r);

const escapeHtml = (unsafe) => {
  return unsafe
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");
};

const bot = new Eris(config.token);

bot.info         = logger.info;
bot.warn         = logger.warn;
bot.error        = logger.error;
bot.config       = config;
bot.commands     = new Collection();
bot.startupTime  = Date.now();

fs.readdir(path.join(__dirname, 'commands'), (error, commands) => {
  if (error) throw error;
  fs.readdir(path.join(__dirname, 'events'), (error, events) => {
    if (error) throw error;
    for (let i = 0; i < commands.length; i++) {
      const command = require(path.join(__dirname, 'commands', commands[i]));
      bot.commands.set(command.info.name.toLowerCase(), new Command(command));
      if (i === commands.length - 1) {
        bot.info('Loaded ' + bot.commands.size + ' commands!');
        for (let i = 0; i < events.length; i++) {
          require('./events/' + events[i])(bot, r);
          if (i === events.length - 1) {
            bot.info('Loaded ' + events.length + ' events!');
            bot.connect();
          }
        }
      }
    }
  });
});

app.listen(config.port);
