/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Utils  = __webpack_require__(1);
	var data  = __webpack_require__(2);
	var userProfile = __webpack_require__(3);
	var Dropdown = __webpack_require__(4);
	var Furniture  = __webpack_require__(5);
	var welcome = __webpack_require__(6);
	var rootRef = new Wilddog(Utils.urls.root);
	var furnitureRef = new Wilddog(Utils.urls.furniture);
	var backgroundRef = new Wilddog(Utils.urls.background);

	/*
	* Application Module
	*
	* This is the main module that initializes the entire application.
	*/

	var app = {
	  $app: null,
	  $alert: null,
	  maxZIndex: 0,


	  /*
	  * Initalize the application
	  *
	  * Get intials dump of Wilddog furniture data.
	  */

	  init: function() {
	    // REGISTER ELEMENTS
	    this.$app = $("#app");
	    this.$officeSpace = $("#office-space");
	    this.$officeSpaceWrapper = $("#office-space-wrapper");
	    this.$alert = $(".alert");
	    this.createDropdowns();
	    this.setOfficeBackground();
        this.renderFurniture();
	    this.hideWelcomeScreen();
	  },



	  /*
	  * Create Dropdowns
	  *
	  * Create add furniture and background dropdowns
	  */

	  createDropdowns: function() {
	    var self = this;
	    var $addFurniture = $('#add-furniture');
	    var $addBackground = $('#select-background');

	    //CREATE NEW FURNITURE OBJECTS
	    this.furnitureDropdown = new Dropdown($addFurniture, data.furniture, 'furniture');
	    this.backgroundDropdown = new Dropdown($addBackground, data.backgrounds, 'background');

	    // LISTEN FOR CLICK EVENT ON DROPDOWNS
	    $('.dropdown').on('click', '.dropdown-button', function(e) {
	      e.preventDefault();
	      var button = $(e.currentTarget);
	      var type = button.data('type');
	      var name = button.data('name');

	      switch(type) {
	        case 'furniture': self.addFurniture(name); break;
	        case 'background': self.changeBackground(name); break;
	      }
	    });
	  },


	  /*
	  * Change Office Space Background
	  *
	  */

	  changeBackground: function(name) {
	    backgroundRef.set(name);
	  },


	  /*
	  * Set Office Space Background
	  *
	  */

	  setOfficeBackground: function() {
	    var self = this;

	    // LISTEN FOR FIREBASE UPDATE
	    backgroundRef.on('value', function(snapshot) {
	      var value = snapshot.val();
	      var pattern = value ? 'background-' + value : '';

	      self.$officeSpaceWrapper.removeClass().addClass('l-canvas-wrapper l-center-canvas ' +  pattern);
	    });
	  },


	  /*
	  * Add Furniture
	  *
	  * Adds a blank piece of new furniture
	  */

	  addFurniture: function(type) {
	    furnitureRef.push({
	      top: 400,
	      left: 300,
	      type: type,
	      rotation: 0,
	      locked: false,
	      "zIndex": this.maxZIndex + 1,
	      name: ""
	    });
	  },


	  /*
	  * Create Furniture
	  *
	  * Adds a piece of furniture using a Wilddog data snapshot
	  */

	  createFurniture: function(snapshot) {
	    new Furniture(snapshot, this);
	  },


	  /*
	  * Render Furniture
	  *
	  * Renders all existing furnture and adds new items
	  * when the Wilddog is updated
	  */

	  renderFurniture: function(){
	    var self = this;

	    // ADD ALL EXISTING FURNITURE
	    furnitureRef.once("value", function(snapshot){
	      self.setMaxZIndex(snapshot, true);

	      snapshot.forEach(function(childSnapshot) {
	        self.createFurniture(snapshot);
	      });
	    });

	    // LISTEN FOR NEW FURNITURE AND ADD IT
	    furnitureRef.on("child_added", function(snapshot){
	      self.setMaxZIndex(snapshot);
	      self.createFurniture(snapshot);
	    });
	  },


	  /*
	  * Log out of App
	  *
	  */

	  logout: function(){
	    this.$signOutButton.on("click", function(e){
	      rootRef.unauth();
	    });
	  },


	  /*
	  * Show App Welcome Screen
	  *
	  */

	  showWelcomeScreen: function(){
	    this.$welcome.removeClass("is-hidden");
	    this.$app.addClass("is-hidden");
	  },


	  /*
	  * Hide App Welcome Screen
	  *
	  */

	  hideWelcomeScreen: function(){
	  //  this.$welcome.addClass("is-hidden");
	    this.$app.removeClass("is-hidden");
	  },


	  /*
	  * Set Furniture Stacking Order (zIndex)
	  *
	  */

	  setMaxZIndex: function(snapshot, hasChildren) {
	    var value = snapshot.val();

	    if (hasChildren) {
	      var maxItem = _.max(value, function(item){
	        return item['zIndex'];
	      });

	      this.maxZIndex = maxItem['zIndex'] || 0;
	    }
	    else {
	      var zIndex = (value['zIndex'] >= this.maxZIndex) ? value['zIndex'] : this.maxZIndex;
	      this.maxZIndex = zIndex;
	    }
	  }
	};


	/*
	* Initialize App
	*
	*/

	$(document).ready(function() {
	  app.init();
	});


	// EXPORT MODULE
	module.exports = app;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// APP FIREBASE URL
	var root = 'https://officemover.wilddogio.com/';


	/*
	* Helper Utilities
	*
	*/

	var utils = {
	  urls: {
	    root: root,
	    furniture: root + 'furniture',
	    background: root + 'background'
	  }
	};


	// EXPORT MODULE
	module.exports = utils;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var data = {
	  backgrounds: [
	    {
	      name: 'carpet',
	      description: 'Casino Carpet',
	      background: 'background-preview-carpet'
	    },
	    {
	      name: 'grid',
	      description: 'Grid Pattern',
	      background: 'background-preview-grid'
	    },
	    {
	      name: 'wood',
	      description: 'Hardwood Floor',
	      background: 'background-preview-wood'
	    },
	    {
	      name: 'tile',
	      description: 'Tile Flooring',
	      background: 'background-preview-tile'
	    },
	    {
	      name: '',
	      description: 'No Background',
	      background: ''
	    }
	  ],

	  furniture: [
	    {
	      name: 'android',
	      description: 'Android Toy',
	      icon: 'icon-android'
	    },
	    {
	      name: 'ballpit',
	      description: 'Ball Pit Pool',
	      icon: 'icon-ballpit'
	    },
	    {
	      name: 'desk',
	      description: 'Office Desk',
	      icon: 'icon-desk'
	    },
	    {
	      name: 'dog_corgi',
	      description: 'Dog (Corgi)',
	      icon: 'icon-dog'
	    },
	    {
	      name: 'dog_retriever',
	      description: 'Dog (Retriever)',
	      icon: 'icon-dog'
	    },
	    {
	      name: 'laptop',
	      description: 'Laptop',
	      icon: 'icon-laptop'
	    },
	    {
	      name: 'nerfgun',
	      description: 'Nerfgun Pistol',
	      icon: 'icon-nerfgun'
	    },
	    {
	      name: 'pacman',
	      description: 'Pacman Arcade',
	      icon: 'icon-game'
	    },
	    {
	      name: 'pingpong',
	      description: 'Ping Pong Table',
	      icon: 'icon-pingpong'
	    },
	    {
	      name: 'plant1',
	      description: 'Plant (Shrub)',
	      icon: 'icon-plant'
	    },
	    {
	      name: 'plant2',
	      description: 'Plant (Succulent)',
	      icon: 'icon-plant'
	    },
	    {
	      name: 'redstapler',
	      description: 'Red Stapler',
	      icon: 'icon-stapler'
	    }
	  ]
	};

	module.exports = data;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*
	* User Profile Module
	*
	*/

	var userProfile = {
	  template: _.template($('#template-profile').html()),
	  container: $('#profile'),

	  /*
	  * Initalize Profile Module
	  *
	  */

	  init: function(data) {
	    var hasData = (data && data.google && data.google.cachedUserProfile);

	    if(hasData) {
	      this.data = data.google.cachedUserProfile;
	      this.render();
	    }
	  },


	  /*
	  * Render Profile to DOM
	  *
	  */

	  render: function() {
	    var $profile = this.template(this.data);

	    this.container.html('').addClass('is-visible').append($profile);
	  }
	};


	// EXPORT MODULE
	module.exports = userProfile;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
	* Dropdown Menu Module
	*
	*/

	var Dropdown = function($parent, data, type) {
	  var ListTemplate = _.template($('#template-dropdown').html());
	  var liTemplate = _.template($('#template-dropdown-item').html());
	  var buttonList = '';

	  // LOOP THROUGH DATA & CREATE BUTTONS
	  for(var i = 0, l = data.length; i < l; i++) {
	    buttonList = buttonList + liTemplate({
	      name: data[i].name,
	      description: data[i].description,
	      background: data[i].background,
	      icon: data[i].icon,
	      type: type
	    });
	  }

	  // ADD DROPDOWN TO DOM
	  $parent.append(ListTemplate({items: buttonList}));

	  //TOGGLE MENU OPEN/CLOSE
	  $parent.on('click', function(e) {
	    e.preventDefault();
	    $parent.find('.dropdown, .dropdown-overlay').toggleClass('is-visible');
	  });

	  // CLOSE MENU WHEN CLICKING OVERLAY
	  $parent.on('click', '.dropdown-overlay', function(e) {
	    e.stopPropagation();
	    $parent.find('.dropdown, .dropdown-overlay').removeClass('is-visible');
	  });
	};


	// EXPORT MODULE
	module.exports = Dropdown;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var utils  = __webpack_require__(1);
	var furnitureRef = new Wilddog(utils.urls.furniture);

	/*
	* FURNITURE MODULES
	*
	* This is a furniture class and must be instaniated like
	* a normal class with the "new" keyword.
	*/

	var Furniture = function(snapshot, app) {
	  var self = this;
	  var data = snapshot.val();
	  var template = _.template($('#template-furniture-item').html());
	  this.app = app;
	  this.id = snapshot.key();
	  this.ref = snapshot.ref();

	  /*
	  * Update Furniture Values
	  *
	  */

	  this.updateValues = function (data) {
	    this.type = data.type;
	    this.locked = data.locked;
	    this.rotation = data.rotation;
	    this.top = data.top;
	    this.left = data.left;
	    this.name = data.name;
	    this.zIndex = data['zIndex'];
	  };

	  this.updateValues(data);


	  /*
	  * Register DOM ELEMENTS
	  *
	  */
	  var furniture = template({
	    type: this.type,
	    name: this.name
	  });

	  this.officeSpace = $('#office-space');
	  this.element = $(furniture.trim());
	  this.tooltip = this.element.find(".tooltip");
	  this.nameEl = this.element.find(".furniture-name");


	  /*
	  * Render Furniture to DOM
	  *
	  */

	  this.render = function(){
	    // SET DESK NAME
	    if(this.type === 'desk') {
	      this.nameEl.text(this.name);
	    }

	    // ROTATE ELEMENT
	    this.element.removeClass('rotate-0 rotate-90 rotate-180 rotate-270')
	    .addClass('rotate-' + this.rotation);


	    // SET CURRENT LOCATION ON CANVAS
	    this.element.css({
	      "top": parseInt(this.top, 10),
	      "left": parseInt(this.left, 10),
	      "zIndex": parseInt(this.zIndex, 10),
	    });


	    // SET ACTIVE STATE
	    if (this.locked){
	      this.element.addClass("is-active is-top");
	    }
	    else {
	      this.element.removeClass("is-active is-top");
	    }

	    // ADD TO DOM
	    this.officeSpace.append(this.element);
	  };


	  /*
	  * Edit name on desk
	  */

	  this.editName = function(){
	    var name = window.prompt("Who sits here?", this.name);
	    this.ref.child("name").set(name);
	  };


	  /*
	  * Rotate furniture
	  */

	  this.rotate = function(){
	    var rotate = (this.rotation <= 0) ? 270 : this.rotation - 90;

	    //FIND CURRENT LOCATION
	    var left = parseInt(this.element.css('left'), 10);
	    var top = parseInt(this.element.css('top'), 10);
	    var height = parseInt(this.element.height(), 10);
	    var width = parseInt(this.element.width(), 10);

	    //TOP: ADD HALF OF HEIGHT SUBTRACT HALF WIDTH
	    var newTop = top + (height / 2) - (width / 2);

	    //LEFT: ADD HALF THE WIDTH SUBTRACT HALF THE HEIGHT
	    var newLeft = left + (width / 2) - (height / 2);


	    this.ref.update({
	      rotation: rotate,
	      left: newLeft,
	      top: newTop
	    });
	  };


	  /*
	  * Delete furniture and remove from screen
	  */

	  this.delete = function(){
	    this.ref.remove();
	  };


	  /*
	  * Destroy element
	  */

	  this.destroy = function() {
	    this.ref.off();
	    this.element.addClass('animated fadeOut');

	    setTimeout(function() {
	      self.element.remove();
	    }, 2000);
	  };


	  /*
	  * Activated Tooltip Menu
	  */

	  this.activateTooltip = function(){
	    // SHOW TOOLTIP WHEN CLICKING ON FURNITURE
	    this.element.on("click", function(e){
	      self.tooltip.toggleClass("is-hidden");
	      self.element.toggleClass("is-active is-top");
	    });

	    // ADD CLICK EVENT TO BUTTONS
	    this.tooltip.on("click", function(e){
	      e.stopPropagation();
	      var $el = $(e.target);
	      var action = $el.data("tooltip-action");

	      // HIDE TOOLTIP AND DESELECT
	      self.tooltip.addClass("is-hidden");
	      self.element.removeClass("is-active is-top");

	      switch (action) {
	        case "edit": self.editName(); break;
	        case "rotate": self.rotate(); break;
	        case "delete": self.delete(); break;
	      }
	    });
	  };


	  /*
	  * Listen for updates
	  */

	  this.ref.on("value", function(snap){
	    var value = snap.val();

	    if(value === null) {
	      //FURNITURE HAS BEEN DELETED
	      self.destroy();
	    }
	    else {
	      // FURNITURE UPDATED WITH NEW VALUES
	      self.updateValues(value);
	      self.app.setMaxZIndex(snap);
	      self.render();
	    }
	  });


	  /*
	  * Initialize furniture module
	  *
	  */

	  this.initElement = function() {
	    //SET DRAG OPTIONS
	    this.element.draggable({
	      containment: self.officeSpace,
	      start: function(event, ui){
	        self.tooltip.addClass("is-hidden");
	        self.element.addClass("is-active is-top");
	        self.ref.child("locked").set(true);
	      },

	      drag: function(event, ui){
	        self.ref.child("left").set(ui.position.left);
	        self.ref.child("top").set(ui.position.top);
	      },

	      stop: function(event, ui){
	        var zIndex = self.app.maxZIndex + 1;
	        self.element.removeClass("is-active is-top");
	        self.ref.child("locked").set(false);
	        self.ref.child("zIndex").set(zIndex);
	        self.app.maxZIndex = zIndex;
	      }
	    });

	    // ACTIVATE TOOLTIP MENU
	    this.activateTooltip();

	    // RENDER
	    this.render();
	  };

	  /*
	  * Create Furniture Element
	  */

	  this.initElement();
	};


	// EXPORT MODULE
	module.exports = Furniture;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var utils  = __webpack_require__(1);
	var rootRef = new Wilddog(utils.urls.root);

	/*
	* Welcome module
	*
	* This is the module that sets up the welcome page and Google login
	*/

	var welcome = {
	  $alert: null,
	  $signInButtons: null,

	  init: function(){
	    var self = this;

	    // REGISTER ELEMENTS
	    this.$alert = $(".alert");
	    this.$signInButtons = $(".welcome-hero-signin");

	    // SETUP LOGIN BUTTON
	    this.$signInButtons.on("click", function(e){
	      var provider = $(this).data("provider");

	      rootRef.authWithOAuthPopup(provider, function(error, authData){
	        if (error){
	          console.log(error);
	          self.$alert.removeClass("is-hidden");
	        }
	        else {
	          self.$alert.addClass("is-hidden");
	        }
	      });
	    });
	  }
	};


	// EXPORT MODULE
	module.exports = welcome;

/***/ }
/******/ ]);
