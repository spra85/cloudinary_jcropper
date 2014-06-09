describe("PhotoCropper", function() {
  var subject = PhotoCropper;
  var originalPhoto;
  var primaryCrop;
  var thumbnailCrop;
  var saveButton;

  beforeEach(function() {
    originalPhoto = affix('img.photo-cropper-original-photo[src="http://placehold.it/100x100"][data-original-width="100"][data-original-height="100"]');
    primaryCrop = affix('img.crop-selection[data-crop-type="primary"]');
    thumbnailCrop = affix('img.crop-selection[data-crop-type="thumbnail"]');
    saveButton = affix('a.save-crop');
    affix('input#crops[type="hidden"]');
    subject.defaults.debug = false;
  });

  describe("init", function() {
    beforeEach(function() {
      spyOn(_, "bindAll");
      spyOn(subject, "initOptions");
      spyOn(subject, "cacheElements");
      spyOn(subject, "initEventHandlers");
      spyOn(subject, "initPhoto");
      subject.init();
    });

    it("binds all externally called functions", function() {
      expect(_.bindAll).toHaveBeenCalledWith(subject, "loadCrop", "saveCrop", "showCoordinates", "setCrop");
    });

    it("sets up cropper options", function() {
      expect(subject.initOptions).toHaveBeenCalled();
    });

    it("caches elements", function() {
      expect(subject.cacheElements).toHaveBeenCalled();
    });

    it("sets up event handlers", function() {
      expect(subject.initEventHandlers).toHaveBeenCalled();
    });

    it("initializes the photo", function() {
      expect(subject.initPhoto).toHaveBeenCalled();
    });
  });

  describe("initOptions", function() {
    var originalDefaults = subject.defaults;
    var newDefaults = {
      crops: {
        primary: { ratio: 5/3 },
        thumbnail: { ratio: 1 }
      }
    };

    beforeEach(function() {
      subject.defaults = newDefaults;
      subject.initOptions({
        crops: {
          primary: { ratio: 7 / 3 }
        }
      });
    });

    afterEach(function() {
      subject.defaults = originalDefaults;
    });

    it("sets up a default set of options", function() {
      expect(subject.options).toEqual({
        crops: {
          primary: { ratio: 7/3 }
        }
      });
    });
  });

  describe("initPhoto", function() {
    beforeEach(function() {
      subject.initOptions();
      subject.cacheElements();
      spyOn(subject, "parseCloudinaryUrl");
    });

    describe("with no initial src", function() {
      beforeEach(function() {
        subject.originalPhoto.attr("src", "");
        subject.initPhoto();
      });

      it("should not try to parse the cloudinary url", function() {
        expect(subject.parseCloudinaryUrl).not.toHaveBeenCalled();
      });
    });

    describe("with an initial src", function() {
      var initialUrl = "http://res.cloudinary.com/cloudinary-cloud-name/image/upload/x_162,y_1500,c_crop,w_645,h_100/w_500,h_225,c_fill/v1401820250/uaqyn2dme40n21d1vmuy.jpg";
      beforeEach(function() {
        subject.originalPhoto.attr("src", initialUrl);
        subject.initPhoto();
      });

      it("should try to parse the cloudinary url", function() {
        expect(subject.parseCloudinaryUrl).toHaveBeenCalledWith(initialUrl);
      });
    });
  });

  describe("destroyPhotoCropper", function() {
    var cropper = { destroy: function() {} };

    beforeEach(function() {
      spyOn(cropper, "destroy");
    });

    describe("no cropper", function() {
      beforeEach(function() {
        subject.destroyPhotoCropper();
      });

      it("does not call destroy on the cropper", function() {
        expect(cropper.destroy).not.toHaveBeenCalled();
      });
    });

    describe("with cropper", function() {
      beforeEach(function() {
        subject.photoCropper = cropper;
        subject.destroyPhotoCropper();
      });

      it("destroys the cropper", function() {
        expect(cropper.destroy).toHaveBeenCalled();
      });
    });
  });

  describe("cacheElements", function() {
    beforeEach(function() {
      subject.initOptions();
      subject.cacheElements();
    });

    it("has an original photo", function() {
      expect(subject.originalPhoto).toBeJqueryWrapped(".photo-cropper-original-photo");
    });

    it("has photo crop selections", function() {
      expect(subject.photoCropSelections).toBeJqueryWrapped(".crop-selection");
    });

    it("has a save button", function() {
      expect(subject.saveButton).toBeJqueryWrapped(".save-crop");
    });

    it("has an input to store crops", function() {
      expect(subject.cropInput).toBeJqueryWrapped("#crops");
    });
  });

  describe("updatePhoto", function() {
    beforeEach(function() {
      subject.cacheElements();
      spyOn(subject, "reset");
      spyOn(subject, "parseCloudinaryUrl");
      subject.updatePhoto('http://foo.com/bar.jpg');
    });

    it("updates the original photo source", function() {
      expect(originalPhoto.attr("src")).toEqual("http://foo.com/bar.jpg");
    });

    it("parses the the new url to set properties on the cropper", function() {
      expect(subject.parseCloudinaryUrl).toHaveBeenCalledWith("http://foo.com/bar.jpg");
    });

    it("resets the cropper", function() {
      expect(subject.reset).toHaveBeenCalled();
    });
  });

  describe("reset", function() {
    beforeEach(function() {
      subject.cacheElements();
      subject.cropInput.val({ foo: 'bar' });
      subject.reset();
    });

    it("clears out the crop input values", function() {
      expect(subject.cropInput.val()).toEqual('{}');
    });
  });

  describe("initEventHandlers", function() {
    beforeEach(function() {
      subject.initOptions();
      subject.cacheElements();
      spyOn(subject, "loadCrop");
      spyOn(subject, "saveCrop");
      spyOn(subject, "setCrop");
      subject.initEventHandlers();
    });

    it("loads the crop when a photo crop selection is clicked", function() {
      subject.photoCropSelections.trigger("click");
      expect(subject.loadCrop).toHaveBeenCalled();
    });

    it("saves the crop when the save button is clicked", function() {
      subject.saveButton.trigger("click");
      expect(subject.saveCrop).toHaveBeenCalled();
    });

    it("sets the crop when the photo cropper is ready", function() {
      subject.originalPhoto.trigger("photo-cropper:ready");
      expect(subject.setCrop).toHaveBeenCalled();
    });
  });

  describe("generateCloudinaryUrl", function() {
    var coordinateInfo = {
      primary: {
        x: 162,
        y: 71,
        w: 3889,
        h: 1506
      }
    };

    beforeEach(function() {
      subject.initOptions();
      subject.cacheElements();
      subject.cloudinaryCloudName = "cloudinary-name";
      subject.cloudinaryPublicId = "original_photo_public_id";
      subject.cropInput.val(JSON.stringify(coordinateInfo));
    });

    it("returns the generated cloudinary url with crop transformations", function() {
      expect(subject.generateCloudinaryUrl("primary")).toEqual(
        "http://res.cloudinary.com/cloudinary-name/image/upload/x_162,y_71,c_crop,w_3889,h_1506/w_645,c_fill/original_photo_public_id.jpg"
      );
    });
  });

  describe("updateCropImage", function() {
    var croppedUpdateHandler = jasmine.createSpy();
    var coordinateInfo = {
      primary: {
        x: 162,
        y: 71,
        w: 3889,
        h: 1500,
      }
    };

    beforeEach(function() {
      subject.initOptions();
      subject.cacheElements();
      subject.cropInput.val(JSON.stringify(coordinateInfo));
      subject.cropInput.on("photo-cropper:crop-updated", croppedUpdateHandler);
      subject.updateCropImage("primary");
    });

    it("updates the src of the cropped image", function() {
      expect(primaryCrop.attr("src")).toEqual(
        "http://res.cloudinary.com/cloudinary-name/image/upload/x_162,y_71,c_crop,w_3889,h_1500/w_645,c_fill/original_photo_public_id.jpg"
      );
    });

    it("calls the cropped update handler", function() {
      expect(croppedUpdateHandler).toHaveBeenCalled();
    });
  });

  describe("aspectRatio", function() {
    beforeEach(function() {
      subject.cropType = "primary";
    });

    it("returns the crops aspect ratio", function() {
      expect(subject.aspectRatio()).toEqual(4 / 3);
    });
  });

  describe("initializeJCropper", function() {
    var count = 0;

    beforeEach(function(done) {
      subject.initOptions();
      subject.cacheElements();
      subject.cropType = "primary";
      spyOn($.fn, "Jcrop").and.callThrough();
      spyOn(subject.originalPhoto, "trigger").and.callFake(function() {
        count += 1;
      });
      subject.initializeJCropper();
      var testInterval = setInterval(function() {
        if(count > 0) {
          window.clearInterval(testInterval);
          done();
        }
      }, 50);
    });

    it("sets up a Jcrop cropper", function() {
      expect($.fn.Jcrop).toHaveBeenCalled();
      expect(subject.photoCropper).toBeObject();
    });

    it("sends photoCropperReady event", function() {
      expect(subject.originalPhoto.trigger).toHaveBeenCalledWith("photo-cropper:ready");
    });
  });

  describe("setCrop", function() {
    var photoCropper = { setSelect: function(){} };

    beforeEach(function() {
      subject.photoCropper = photoCropper;
      subject.initOptions();
      subject.cacheElements();
      subject.cropType = "primary";
      spyOn(subject.photoCropper, "setSelect");
    });

    describe("with crop", function() {
      var crops = {
        primary: {
          x: 162,
          y: 71,
          x2: 4050,
          y2: 2989
        }
      };

      beforeEach(function() {
        subject.cropInput.val(JSON.stringify(crops));
        subject.setCrop();
      });

      it("sets crop selection based on crop type coordinates", function() {
        expect(subject.photoCropper.setSelect).toHaveBeenCalledWith([
          162, 71, 4050, 2989
        ]);
      });
    });

    describe("without crop", function() {
      beforeEach(function() {
        subject.cropInput.val(JSON.stringify({}));
        subject.setCrop();
      });

      it("sets the crop selection to an initial set based on aspect ratio", function() {
        expect(subject.photoCropper.setSelect).toHaveBeenCalledWith([
          0, 0, 75, 56.25
        ]);
      });
    });
  });

  describe("loadCrop", function() {
    beforeEach(function() {
      saveButton.hide();
      subject.cropType = "";
      spyOn(subject, "destroyPhotoCropper");
      spyOn(subject, "initializeJCropper");
      subject.loadCrop(_.extend(eventStub, { target: thumbnailCrop }));
    });

    it("shows the save button", function() {
      expect(saveButton).toBeVisible();
    });

    it("sets the cropType of the photo cropper", function() {
      expect(subject.cropType).toEqual("thumbnail");
    });

    it("destroys any existing photo cropper", function() {
      expect(subject.destroyPhotoCropper).toHaveBeenCalled();
    });

    it("initializes the Jcropper", function() {
      expect(subject.initializeJCropper).toHaveBeenCalled();
    });
  });

  describe("showCoordinates", function() {
    var coordinates = {
      h: 100,
      w: 100,
      x: 162,
      y: 71,
      x2: 4050,
      y2: 2989
    };

    beforeEach(function() {
      spyOn(console, "log");
    });

    it("shows coordinates of the crop area if debug true", function() {
      subject.options.debug = true;
      subject.showCoordinates(coordinates);
      expect(console.log).toHaveBeenCalled();
    });

    it("does not show coordinates of the crop area if debug false", function() {
      subject.options.debug = false;
      subject.showCoordinates(coordinates);
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe("saveCrop", function() {
    var coordinates = {
      h: 100,
      w: 100,
      x: 161.67,
      y: 71.000,
      x2: 4049.85,
      y2: 2988.54
    };
    var roundedCoordinates = {
      h: 100,
      w: 100,
      x: 162,
      y: 71,
      x2: 4050,
      y2: 2989
    };

    beforeEach(function() {
      subject.initOptions();
      subject.cacheElements();
      subject.cropInput.val(JSON.stringify({}));
      subject.cropType = "primary";
      subject.initializeJCropper();
      spyOn(subject.photoCropper, "tellSelect").and.returnValue(coordinates);
      spyOn(subject, "updateCropImage");
      spyOn(subject, "destroyPhotoCropper");
      subject.saveCrop(eventStub);
    });

    it("prevents default behavior", function() {
      expect(eventStub.preventDefault).toHaveBeenCalled();
    });

    it("updates the stored crop values for the crop selection type", function() {
      expect(JSON.parse(subject.cropInput.val()).primary).toEqual(roundedCoordinates);
    });

    it("updates the cropped image based on the cropped selection", function() {
      expect(subject.updateCropImage).toHaveBeenCalledWith("primary");
    });

    it("destroys the existing photo cropper", function() {
      expect(subject.destroyPhotoCropper).toHaveBeenCalled();
    });
  });

  describe("roundCoordinates", function() {
    var coordinates = {
      h: 2917.823639774859,
      w: 3888.0000000000005,
      x: 369.36,
      x2: 4257.360000000001,
      y: 136.16510318949344,
      y2: 3053.9887429643527
    };
    var roundedCoordinates = {
      h: 2918,
      w: 3888,
      x: 369,
      x2: 4257,
      y: 136,
      y2: 3054
    };

    it("rounds all the values returned from Jcrop", function() {
      expect(subject.roundCoordinates(coordinates)).toEqual(roundedCoordinates);
    });
  });

  describe("parseCloudinaryUrl", function() {
    beforeEach(function() {
      subject.cloudinaryVersion = "";
      subject.cloudinaryPublicId = "";
      subject.cloudinaryCloudName = "";
      spyOn(console, "error");
    });

    it("logs a console error if cloudinary url invalid", function() {
      subject.parseCloudinaryUrl("http://res.cloudinary.com/cloudinary-cloud-name/foo.jpg");
      expect(console.error).toHaveBeenCalledWith("Invalid cloudinary image url");
    });

    it("parses a cloudinary URL with no transformations and no file extension", function() {
      subject.parseCloudinaryUrl("http://res.cloudinary.com/cloudinary-cloud-name/image/upload/v1401820250/uaqyn2dme40n21d1vmuy");
      expect(subject.cloudinaryVersion).toEqual("1401820250");
      expect(subject.cloudinaryPublicId).toEqual("uaqyn2dme40n21d1vmuy");
      expect(subject.cloudinaryCloudName).toEqual("cloudinary-cloud-name");
    });

    it("parses a cloudinary URL with no transformations", function() {
      subject.parseCloudinaryUrl("http://res.cloudinary.com/cloudinary-cloud-name/image/upload/v1401820250/uaqyn2dme40n21d1vmuy.jpg");
      expect(subject.cloudinaryVersion).toEqual("1401820250");
      expect(subject.cloudinaryPublicId).toEqual("uaqyn2dme40n21d1vmuy");
      expect(subject.cloudinaryCloudName).toEqual("cloudinary-cloud-name");
    });

    it("parses a cloudinary URL with a single transformation", function() {
      subject.parseCloudinaryUrl("http://res.cloudinary.com/cloudinary-cloud-name/image/upload/x_162,y_1500,c_crop,w_645,h_100/v1401820250/uaqyn2dme40n21d1vmuy.jpg");
      expect(subject.cloudinaryVersion).toEqual("1401820250");
      expect(subject.cloudinaryPublicId).toEqual("uaqyn2dme40n21d1vmuy");
      expect(subject.cloudinaryCloudName).toEqual("cloudinary-cloud-name");
    });

    it("parses a cloudinary URL with multiple transformations", function() {
      subject.parseCloudinaryUrl("http://res.cloudinary.com/cloudinary-cloud-name/image/upload/x_162,y_1500,c_crop,w_645,h_100/w_500,h_225,c_fill/v1401820250/uaqyn2dme40n21d1vmuy.jpg");
      expect(subject.cloudinaryVersion).toEqual("1401820250");
      expect(subject.cloudinaryPublicId).toEqual("uaqyn2dme40n21d1vmuy");
      expect(subject.cloudinaryCloudName).toEqual("cloudinary-cloud-name");
    });
  });

  describe("cropTransformation", function() {
    it("returns the expected c_crop format for the cloudinary crop transformation", function() {
      expect(subject.cropTransformation({ x: 62, y: 150, w: 500, h: 560 })).toEqual("/x_62,y_150,c_crop,w_500,h_560");
    });
  });

  describe("resizeTransformation", function() {
    it("returns the expected format to resize the image post cropping", function() {
      expect(subject.resizeTransformation("primary")).toEqual("/w_645,c_fill/");
    });
  });
});
