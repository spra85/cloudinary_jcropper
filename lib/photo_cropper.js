var PhotoCropper = {
  originalPhoto: undefined,
  cropper: undefined,
  defaults: {
    debug: true,
    crops: {
      primary: { ratio: 4 / 3, width: 645 },
      thumbnail: { ratio: 1, width: 60 },
      slice: { ratio: 1 / 3, width: 100 }
    },
    originalPhotoSelector: ".photo-cropper-original-photo",
    cropOptionSelector: ".crop-selection",
    saveCropSelector: ".save-crop",
    cropInputSelector: "#crops"
  },

  init: function(options) {
    _.bindAll(this, "loadCrop", "saveCrop", "showCoordinates", "setCrop");
    this.initOptions(options);
    this.cacheElements();
    this.initEventHandlers();
  },


  initOptions: function(options) {
    this.options = _.defaults(options || {}, this.defaults);
  },

  destroyPhotoCropper: function() {
    if(typeof this.photoCropper !== "undefined") {
      this.photoCropper.destroy();
    }
  },

  cacheElements: function() {
    this.originalPhoto = $(this.options.originalPhotoSelector);
    this.photoCropSelections = $(this.options.cropOptionSelector);
    this.saveButton = $(this.options.saveCropSelector);
    this.cropInput = $(this.options.cropInputSelector);
  },

  updatePhoto: function(imageUrl) {
    this.originalPhoto.attr("src", imageUrl);
    this.reset();
  },

  reset: function() {
    this.cropInput.val(JSON.stringify({}));
  },

  initEventHandlers: function() {
    this.photoCropSelections.on("click", this.loadCrop);
    this.saveButton.on("click", this.saveCrop);
    this.originalPhoto.on("photo-cropper:ready", this.setCrop);
  },

  generateCloudinaryUrl: function(cropType) {
    var publicId = this.originalPhoto.data("public-id");
    var cloudinaryName = this.originalPhoto.data("cloudinary-name");
    var cropCoordinates = JSON.parse(this.cropInput.val())[cropType];
    var url = "http://res.cloudinary.com/" + cloudinaryName + "/image/upload";
    url += "/x_" + cropCoordinates.x + ",y_" + cropCoordinates.y + ",c_crop" + ",w_" + cropCoordinates.w + ",h_" + cropCoordinates.h;
    url += "/w_" + this.options.crops[cropType].width + ",c_fill/" + publicId + ".jpg";
    return url;
  },

  updateCropImage: function(cropType) {
    var newUrl = this.generateCloudinaryUrl(cropType);
    $('[data-crop-type="' + cropType + '"]').attr("src", newUrl);
  },

  aspectRatio: function() {
    return this.options.crops[this.cropType].ratio;
  },

  initializeJCropper: function() {
    var that = this;

    this.originalPhoto.Jcrop({
      onSelect: that.showCoordinates,
      aspectRatio: that.aspectRatio(),
      keySupport: false, //https://github.com/tapmodo/Jcrop/issues/102
      trueSize: [
        that.originalPhoto.data("original-width"),
        that.originalPhoto.data("original-height")
      ]
    }, function() {
      that.photoCropper = this;
      that.originalPhoto.trigger("photo-cropper:ready");
    });
  },

  setCrop: function() {
    var cropCoordinates = JSON.parse(this.cropInput.val())[this.cropType];

    if(cropCoordinates) {
      this.photoCropper.setSelect([
        cropCoordinates.x,
        cropCoordinates.y,
        cropCoordinates.x2,
        cropCoordinates.y2
      ]);
    } else {
      var aspectRatio = this.aspectRatio();
      var startWidth = 1 / aspectRatio * this.originalPhoto.data("original-width");
      var startHeight = 1 / aspectRatio * startWidth;
      this.photoCropper.setSelect([0, 0, startWidth, startHeight]);
    }
  },

  loadCrop: function(event) {
    var croppedImage = $(event.target);
    this.cropType = croppedImage.data("crop-type");
    $(".save-crop").show();
    this.destroyPhotoCropper();
    this.initializeJCropper();
  },

  showCoordinates: function(coordinates) {
    if(this.options.debug) {
      console.log(
        'h: ' + coordinates.h,
        'w: ' + coordinates.w,
        'x: ' + coordinates.x,
        'x2: ' + coordinates.x2,
        'y: ' + coordinates.y,
        'y2: ' + coordinates.y2
      );
    }
  },

  roundCoordinates: function(coordinates) {
    var keys = _.keys(coordinates);

    _.each(keys, function(key) {
      coordinates[key] = Math.round(coordinates[key]);
    });
    return coordinates;
  },

  saveCrop: function(event) {
    event.preventDefault();
    var coordinates = this.photoCropper.tellSelect();
    var crops = JSON.parse(this.cropInput.val());
    crops[this.cropType] = this.roundCoordinates(coordinates);
    this.cropInput.val(JSON.stringify(crops));
    this.updateCropImage(this.cropType);
    this.destroyPhotoCropper();
  }
};
