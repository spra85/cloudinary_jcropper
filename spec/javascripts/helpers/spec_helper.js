// Stub an event object with a few basic spies
// for assertions.
var eventStub = {
  preventDefault: jasmine.createSpy("preventDefault"),
  stopPropagation: jasmine.createSpy("stopPropagation"),
  target: jasmine.createSpy("target"),
  keyCode: 13 // Send enter keyCode by default
};

