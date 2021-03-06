const express = require('express');
const db = require('../db/models')
const { check, validationResult } = require('express-validator');
const router = express.Router();
const { Tweet } = db;
const asyncHandler = handler => (req, res, next) => handler(req, res, next).catch(next);

const tweetNotFoundError = (tweetId) => {
    const err = Error(`Tweet with id ${tweetId} ain't hurr.`)
    err.title = "Tweet not found."
    err.status = 404;
    return err;
}

const tweetValidator = [
    check('message')
        .exists({checkFalsy: true})
        .withMessage('Tweet must include a message')
        .isLength({max: 280})
        .withMessage('Tweet message must be fewer than 280 characters')
]

const handleValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        const errors = validationErrors.array().map((error) => error.msg);
        const err = Error("Bad request.");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad request.";
        next(err);
    }
    next();
}

router.get("/", asyncHandler(async (req, res) => {
  const tweets = await Tweet.findAll();
  res.json({tweets});
}));

router.get("/:id(\\d+)", asyncHandler(async(req, res, next)=>{

  const tweetId = parseInt(req.params.id, 10);
  const tweet = await Tweet.findByPk(tweetId);
  if(tweet) {
    res.json({tweet});
  } else {
      //
    next(tweetNotFoundError(tweetId));
  }
}));

router.post('/', tweetValidator, handleValidationErrors, asyncHandler(async (req, res) => {
  const { message } = req.body;
  const tweet = await Tweet.create({message});
  res.json({tweet});
}))

router.put("/:id(\\d+)", tweetValidator, handleValidationErrors, asyncHandler(async(req, res, next) =>{
  const tweetId = parseInt(req.params.id, 10);
  const tweet = await Tweet.findByPk(tweetId);
  if(!tweet){
    next(tweetNotFoundError(tweetId))
  } else {
    await tweet.update({message:req.body.message})
    res.json({tweet});
  }
}));

router.delete('/:id(\\d+)', asyncHandler(async (req, res, next) => {
    const tweetId = parseInt(req.params.id, 10);
    const tweet = await Tweet.findByPk(tweetId);
    if (tweet) {
        await tweet.destroy();
        res.status(204).end();
    } else {
        next(tweetNotFoundError(tweetId));
    }
}))

module.exports = router;
