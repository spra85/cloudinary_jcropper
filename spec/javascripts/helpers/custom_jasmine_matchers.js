beforeEach(function() {
  jasmine.addMatchers({
    toBeTrue: function() {
      return {
        compare: function(actual) {
          return {
            pass: actual === true,
            message: "Expected " + actual + " to be true"
          };
        }
      };
    },

    toBeFalse: function() {
      return {
        compare: function(actual) {
          return {
            pass: actual === false,
            message: "Expected " + actual + " to be false"
          };
        }
      };
    },

    toBeEmpty: function() {
      return {
        compare: function(actual) {
          var pass;
          if ((/Array/).test(Object.prototype.toString.call(actual))) {
            pass = actual.length === 0;
          } else {
            for (var prop in actual) {
              pass = false;
            }
            pass = (pass === undefined) ? true : false;
          }
          return {
            pass: pass,
            message: "Expected " + actual + " to be empty"
          };
        }
      };
    },

    toBeObject: function() {
      return {
        compare: function(actual) {
          return {
            pass: compareConstructor(actual, Object),
            message: "Expected " + actual + " to be an Object"
          };
        }
      };
    },

    toBeArray: function() {
      return {
        compare: function(actual) {
          return {
            pass: compareConstructor(actual, Array),
            message: "Expected " + actual + " to be an Array"
          };
        }
      };
    },

    toBeNumber: function() {
      return {
        compare: function(actual) {
          return {
            pass: compareConstructor(actual, Number),
            message: "Expected " + actual + " to be a Number"
          };
        }
      };
    },

    toBeString: function() {
      return {
        compare: function(actual) {
          return {
            pass: compareConstructor(actual, String),
            message: "Expected " + actual + " to be a String"
          };
        }
      };
    },

    toBeFunction: function() {
      return {
        compare: function(actual) {
          return {
            pass: compareConstructor(actual, Function),
            message: "Expected " + actual + " to be a Function"
          };
        }
      };
    },

    toBeTypeof: function() {
      return {
        compare: function(actual, b) {
          return {
            pass: compareConstructor(actual, b),
            message: "Expected " + actual + " to be a typeof " + b
          };
        }
      };
    },

    toDeepEqual: function() {
      var eq = function(a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a == 1 / b;
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null) return a === b;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className != toString.call(b)) return false;
        switch (className) {
          // Strings, numbers, dates, and booleans are compared by value.
          case '[object String]':
            // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
            // equivalent to `new String("5")`.
            return a == String(b);
          case '[object Number]':
            // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
            // other numeric values.
            return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
          case '[object Date]':
          case '[object Boolean]':
            // Coerce dates and booleans to numeric primitive values. Dates are compared by their
            // millisecond representations. Note that invalid dates with millisecond representations
            // of `NaN` are not equivalent.
            return +a == +b;
          // RegExps are compared by their source patterns and flags.
          case '[object RegExp]':
            return a.source == b.source &&
                   a.global == b.global &&
                   a.multiline == b.multiline &&
                   a.ignoreCase == b.ignoreCase;
        }
        if (typeof a != 'object' || typeof b != 'object') return false;
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
        var length = aStack.length;
        while (length--) {
          // Linear search. Performance is inversely proportional to the number of
          // unique nested structures.
          if (aStack[length] == a) return bStack[length] == b;
        }
        // Objects with different constructors are not equivalent, but `Object`s
        // from different frames are.
        var aCtor = a.constructor, bCtor = b.constructor;
        if (aCtor !== bCtor && !(aCtor == Function && (aCtor instanceof aCtor) &&
                                 bCtor == Function && (bCtor instanceof bCtor))
                            && ('constructor' in a && 'constructor' in b)) {
          return false;
        }
        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);
        var size = 0, result = true;
        // Recursively compare objects and arrays.
        if (className == '[object Array]') {
          // Compare array lengths to determine if a deep comparison is necessary.
          size = a.length;
          result = size == b.length;
          if (result) {
            // Deep compare the contents, ignoring non-numeric properties.
            while (size--) {
              if (!(result = eq(a[size], b[size], aStack, bStack))) break;
            }
          }
        } else {
          // Deep compare objects.
          for (var key in a) {
            if (a.hasOwnProperty(key)) {
              // Count the expected number of properties.
              size++;
              // Deep compare each member.
              if (!(result = b.hasOwnProperty(key) && eq(a[key], b[key], aStack, bStack))) break;
            }
          }
          // Ensure that both objects contain the same number of properties.
          if (result) {
            for (key in b) {
              if (b.hasOwnProperty(key) && !(size--)) break;
            }
            result = !size;
          }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return result;
      };
      return {
        compare: function(actual, expected) {
          return {
            pass: eq(actual, expected, [], []),
            message: "Expected " + actual + " to deep equal " + expected
          };
        }
      };
    },

    // jQuery matchers
    toBeJqueryWrapped: function() {
      return {
        compare: function(actual, selector) {
          return {
            pass: (selector && actual && actual.selector !== selector) ? false : checkElementExistence(actual),
            message: "Expected " + actual + " to be a jQuery wrapped element"
          };
        }
      };
    },

    toHaveClass: function() {
      return {
        compare: function(actual, className) {
          return {
            pass: actual.hasClass(className),
            message: "Expected " + actual + " to have class " + className
          };
        }
      };
    },

    toBeHidden: function() {
      return {
        compare: function(actual) {
          return {
            pass: !actual.is(":visible"),
            message: "Expected " + actual + " to be hidden"
          };
        }
      };
    },

    toBeVisible: function() {
      return {
        compare: function(actual) {
          return {
            pass: actual.is(":visible"),
            message: "Expected " + actual + " to be visible"
          };
        }
      };
    },

    toExist: function() {
      return {
        compare: function(actual) {
          return {
            pass: actual.length > 0,
            message: "Expected " + actual + " to exist in the DOM"
          };
        }
      };
    },

    toHaveText: function() {
      return {
        compare: function(actual, text) {
          return {
            pass: actual.text().trim() === text,
            message: "Expected " + actual + " to have text " + '"' + text + '"'
          };
        }
      };
    },

    toHaveHTML: function() {
      return {
        compare: function(actual, html) {
          return {
            pass: actual.html().trim() === html,
            message: "Expected " + actual + " to have HTML " + '"' + html + '"'
          };
        }
      };
    },

    toBeChecked: function() {
      return {
        compare: function(actual) {
          return {
            pass: actual.prop("checked"),
            message: "Expected " + actual + " to be checked"
          };
        }
      };
    },

    toHaveAttribute: function(attr, value) {
      return {
        compare: function(actual, attr, value) {
          var pass;
          var message;
          if (value) {
            pass = (actual.attr(attr) === value);
            message = "Expected " + actual + ' to have the "' + attr + '" attribute with a value of "' + value + '"';
          } else {
            pass = !!actual.attr(attr);
            message = "Expected " + actual + ' to have the "' + attr + '" attribute';
          }
          return {
            pass: pass,
            message: message
          };
        }
      };
    }
  });

  // compareConstructor checks an object against a specific type
  function compareConstructor(a, b) {
    if (typeof a === "undefined") return false;
    return a.constructor == b; // double equals is important here, ignore the linter
  }

  // This function is an exhaustive check for the existence
  // of a jQuery wrapped element. It requires an element to
  // be in the DOM and to be jQuery wrapped
  function checkElementExistence(element) {
    if (typeof element === "undefined") return false;
    if (typeof element.selector === "undefined") return false;
    if (!element.length) return false;
    return compareConstructor(element, jQuery);
  }
});
