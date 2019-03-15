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
app.get('/', passport.authenticate('discord', { scope: scopes }), function(req, res) {});
app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/info') } // auth success
);
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
app.get('/info', checkAuth, function(req, res) {
  let userID = req.user.id;
  r.table('tickets').getAll(userID, { index: 'user' }).orderBy('case').run((err, callback) => {
    // res.json(callback);
    let html = '';
    let ticketName;
    console.log(callback.length);
    for (x in callback) {
      if (callback[x].name !== undefined) ticketName = '#' + callback[x].case + ' - ' + callback[x].name; else ticketName = '#' + callback[x].case;
      console.log(callback[x]);
      html += '<a href="/ticket/'+callback[x].id+'">View ticket ' + ticketName + '</a><br>';
    }
    res.send(html);
    });
});

app.get('/ticket/:ticketID', checkAuth, function (req, res) {
  // res.send(req.params)
  let ticketName;
  r.table('tickets').get(req.params.ticketID).run((err, callback) => {
    if (callback.name !== undefined) ticketName = callback.name;
  });
  r.table('chatlogs').get(req.params.ticketID).run((err, callback) => {
    console.log(err);
    if (ticketName === undefined) name = '#' + callback.case; else name = escapeHtml(ticketName);
    res.send(`<h1>Ticket ${name}</h1><br>` + callback.logs.map(m => '<b>[' + escapeHtml(m.user) + ']</b>: ' + escapeHtml(m.content)).join('<br/>'));
  });
});

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

let r = rethink({
  db: 'ticketbot',
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

app.get('/t/:secret', (req, res) => {
  if (!req.params.secret || req.params.secret === undefined) return res.send('Invalid secret');
  r.table('chatlogs').getAll(req.params.secret, { index: 'secret' }).run((err, callback) => {
    if (callback[0] === undefined) return res.send('Invalid secret');
    callback = callback[0];
    res.send(`<h1>Ticket #${callback.case}</h1><br>` + callback.logs.map(m => '<b>[' + escapeHtml(m.user) + ']</b>: ' + escapeHtml(m.content)).join('<br/>'));
  });
});

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
