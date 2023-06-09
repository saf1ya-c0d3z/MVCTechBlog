const router = require('express').Router();
const { Post, User, Comment } = require('../models');
 const withAuth = require('../utils/auth')


// get all posts 
router.get('/', async (req, res) => {
  try {
    // Get all projects and JOIN with user data
    const postData = await Post.findAll({
      include: [
        {
          model: Comment,
          attributes: ['description'],
        },
      ],
    });

    // Serialize data so the template can read it
    const posts = postData.map((post) => post.get({ plain: true }));

    // Pass serialized data and session flag into template
    res.render('all-posts', { 
      posts, 
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get one post 
router.get('/post/:id', async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      include: [
        {
          model: Comment,
        
          include: [
            {
              model: User,

            }
          ]
        },
      ],
    });

    // if (postData) { //what is this
       const post = postData.get({ plain: true });
      console.log(post)
       res.render('post', { post, logged_in: req.session.logged_in})
    // }


  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
router.get('/profile', withAuth, async (req, res) => {
 try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
     attributes: { exclude: ['password'] },
      include: [{ model: Post }],
    });

    const user = userData.get({ plain: true });
    console.log(user)
    res.render('profile', {
      ...user, 
      posts: user.posts,
      logged_in: true
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/profile');
    return;
  }

  res.render('login');
});

module.exports = router;