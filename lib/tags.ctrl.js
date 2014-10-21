var TagsCtrl = function ($scope, $timeout, $q, $tags, $attrs, $parse, $element, $log) {

  var ngModel = $element.controller('ngModel'),
    opts;

  if (!ngModel) {
    return $log.warn('tags: tag directive used without ngModel');
  }

  opts = angular.extend({}, $tags.options, $scope.$eval($attrs.options));


  ///**
  // * Figures out what classes to put on the tag span.  It'll add classes
  // * if defined by group, and it'll add a selected class if the tag
  // * is preselected to delete.
  // * @param tag
  // * @returns {Object<String,Boolean>}
  // */
  //$scope.getClasses = function getGroupClass(tag) {
  //  var r = {};
  //
  //  if (tag === $scope.toggles.selectedTag) {
  //    r.selected = true;
  //  }
  //  angular.forEach($scope.options.classes, function (klass, groupName) {
  //    if (tag.group === groupName) {
  //      r[klass] = true;
  //    }
  //  });
  //  return r;
  //};
  //
  ///**
  // * Finds a tag in the src list and removes it.
  // * @param tag
  // * @returns {boolean}
  // */
  //$scope._filterSrcTags = function filterSrcTags(tag) {
  //  // wrapped in timeout or typeahead becomes confused
  //  return $timeout(function () {
  //    var idx = $scope.srcTags.indexOf(tag);
  //    if (idx >= 0) {
  //      $scope.srcTags.splice(idx, 1);
  //      $scope._deletedSrcTags.push(tag);
  //      return;
  //    }
  //    return $q.reject();
  //  });
  //};
  //
  ///**
  // * Adds a tag to the list of tags, and if in the typeahead list,
  // * removes it from that list (and saves it).  emits badwing.tags.added
  // * @param tag
  // */
  //$scope.add = function add(tag) {
  //  var _add = function _add(tag) {
  //      $scope.tags.push(tag);
  //      delete $scope.inputTag;
  //      $scope.$emit('badwing.tags.added', {
  //        tag: tag,
  //        $id: $scope.$id
  //      });
  //    },
  //    fail = function fail() {
  //      $scope.$emit('badwing.tags.addfailed', {
  //        tag: tag,
  //        $id: $scope.$id
  //      });
  //      dfrd.reject();
  //    },
  //    i,
  //    dfrd = $q.defer();
  //
  //  // don't add dupe names
  //  i = $scope.tags.length;
  //  while (i--) {
  //    if ($scope.tags[i].name === tag.name) {
  //      fail();
  //    }
  //  }
  //
  //  $scope._filterSrcTags(tag)
  //    .then(function () {
  //      _add(tag);
  //    }, function () {
  //      if ($scope.options.addable) {
  //        _add(tag);
  //        dfrd.resolve();
  //      }
  //      else {
  //        fail();
  //      }
  //    });
  //
  //  return dfrd.promise;
  //};
  //
  ///**
  // * Toggle the input box active.
  // */
  //$scope.selectArea = function selectArea() {
  //  $scope.toggles.inputActive = true;
  //};
  //
  ///**
  // * Removes a tag.  Restores stuff into srcTags if it came from there.
  // * Kills any selected tag.  Emit a badwing.tags.removed event.
  // * @param tag
  // */
  //$scope.remove = function remove(tag) {
  //  var idx;
  //  $scope.tags.splice($scope.tags.indexOf(tag), 1);
  //
  //  if ((idx = $scope._deletedSrcTags.indexOf(tag) >= 0)) {
  //    $scope._deletedSrcTags.splice(idx, 1);
  //    if ($scope.srcTags.indexOf(tag) === -1) {
  //      $scope.srcTags.push(tag);
  //    }
  //  }
  //
  //  delete $scope.toggles.selectedTag;
  //
  //  $scope.$emit('badwing.tags.removed', {
  //    tag: tag,
  //    $id: $scope.$id
  //  });
  //};
  //
  //var srcResult,
  //  source,
  //  tags,
  //  group,
  //  i,
  //  tagsWatch,
  //  srcWatch,
  //  modelWatch,
  //  model,
  //  pureStrings = false,
  //  stringArray = false,
  //
  //
  //  watchModel = function watchModel() {
  //    modelWatch = $scope.$watch('model', function (newVal) {
  //      var deletedTag, idx;
  //      if (angular.isDefined(newVal)) {
  //        tagsWatch();
  //        $scope.tags = format(newVal);
  //
  //        // remove already used tags
  //        i = $scope.tags.length;
  //        while (i--) {
  //          $scope._filterSrcTags($scope.tags[i]);
  //        }
  //
  //        // restore any deleted things to the src array that happen to not
  //        // be in the new value.
  //        i = $scope._deletedSrcTags.length;
  //        while (i--) {
  //          deletedTag = $scope._deletedSrcTags[i];
  //          if ((idx = newVal.indexOf(deletedTag) === -1 &&
  //            $scope.srcTags.indexOf(deletedTag) === -1)) {
  //            $scope.srcTags.push(deletedTag);
  //            $scope._deletedSrcTags.splice(i, 1);
  //          }
  //        }
  //
  //        watchTags();
  //      }
  //    }, true);
  //
  //  },
  //
  //  watchTags = function watchTags() {
  //
  //    /**
  //     * Watches tags for changes and propagates to outer model
  //     * in the format which we originally specified (see below)
  //     */
  //    tagsWatch = $scope.$watch('tags', function (value, oldValue) {
  //      var i;
  //      if (value !== oldValue) {
  //        modelWatch();
  //        if (stringArray || pureStrings) {
  //          value = value.map(function (tag) {
  //            return tag.name;
  //          });
  //          if (angular.isArray($scope.model)) {
  //            $scope.model.length = 0;
  //            for (i = 0; i < value.length; i++) {
  //              $scope.model.push(value[i]);
  //            }
  //          }
  //          if (pureStrings) {
  //            $scope.model = value.join($scope.options.delimiter);
  //          }
  //        }
  //        else {
  //          $scope.model.length = 0;
  //          for (i = 0; i < value.length; i++) {
  //            $scope.model.push(value[i]);
  //          }
  //        }
  //        watchModel();
  //
  //      }
  //    }, true);
  //  },
  //  /**
  //   * Takes a raw model value and returns something suitable
  //   * to assign to$scope.tags
  //   * @param value
  //   */
  //  format = function format(value) {
  //    var arr = [];
  //
  //    if (angular.isUndefined(value)) {
  //      return;
  //    }
  //    if (angular.isString(value)) {
  //      arr = value
  //        .split($scope.options.delimiter)
  //        .map(function (item) {
  //          return {
  //            name: item.trim()
  //          };
  //        });
  //    }
  //    else if (angular.isArray(value)) {
  //      arr = value.map(function (item) {
  //        if (angular.isString(item)) {
  //          return {
  //            name: item.trim()
  //          };
  //        }
  //        else if (item.name) {
  //          item.name = item.name.trim();
  //        }
  //        return item;
  //      });
  //    }
  //    else if (angular.isDefined(value)) {
  //      throw 'list of tags must be an array or delimited string';
  //    }
  //    return arr;
  //  },
  //  /**
  //   * Updates the source tag information.  Sets a watch so we
  //   * know if the source values change.
  //   */
  //  updateSrc = function updateSrc() {
  //    var locals,
  //      i,
  //      o,
  //      obj;
  //    // default to NOT letting users add new tags in this case.
  //    $scope.options.addable = $scope.options.addable || false;
  //    $scope.srcTags = [];
  //    srcResult = $tags.parse($attrs.src);
  //    source = srcResult.source($scope.$parent);
  //    if (angular.isUndefined(source)) {
  //      return;
  //    }
  //    if (angular.isFunction(srcWatch)) {
  //      srcWatch();
  //    }
  //    locals = {};
  //    if (angular.isDefined(source)) {
  //      for (i = 0; i < source.length; i++) {
  //        locals[srcResult.itemName] = source[i];
  //        obj = {};
  //        obj.value = srcResult.modelMapper($scope.$parent, locals);
  //        o = {};
  //        if (angular.isObject(obj.value)) {
  //          o = angular.extend(obj.value, {
  //            name: srcResult.viewMapper($scope.$parent, locals),
  //            value: obj.value.value,
  //            group: obj.value.group
  //          });
  //        }
  //        else {
  //          o = {
  //            name: srcResult.viewMapper($scope.$parent, locals),
  //            value: obj.value,
  //            group: group
  //          };
  //        }
  //        $scope.srcTags.push(o);
  //      }
  //    }
  //
  //    srcWatch =
  //      $scope.$parent.$watch(srcResult.sourceName,
  //        function (newVal, oldVal) {
  //          if (newVal !== oldVal) {
  //            updateSrc();
  //          }
  //        }, true);
  //  };
  //
  //// merge options
  //$scope.options = angular.extend({}, $tags.defaults, $scope.$eval(attrs.options));
  //
  //// break out orderBy for view
  //$scope.orderBy = $scope.options.orderBy;
  //
  //// this should be named something else since it's just a collection
  //// of random shit.
  //$scope.toggles = {
  //  inputActive: false
  //};
  //
  ///**
  // * When we receive this event, sort.
  // */
  //$scope.$on('badwing.tags.sort', function (evt, data) {
  //  $scope.orderBy = data;
  //});
  //
  //// pass typeahead options through
  //$attrs.$observe('typeaheadOptions', function (newVal) {
  //  if (newVal) {
  //    $scope.typeaheadOptions = $parse(newVal)($scope.$parent);
  //  } else {
  //    $scope.typeaheadOptions = {};
  //  }
  //});
  //
  //// determine what format we're in
  //model = $scope.model;
  //if (angular.isString(model)) {
  //  pureStrings = true;
  //}
  //// XXX: avoid for now while fixing "empty array" bug
  //else if (angular.isArray(model) && false) {
  //  stringArray = true;
  //  i = model.length;
  //  while (i--) {
  //    if (!angular.isString(model[i])) {
  //      stringArray = false;
  //      break;
  //    }
  //  }
  //}
  //
  //// watch model for changes and update tags as appropriate
  //$scope.tags = [];
  //$scope._deletedSrcTags = [];
  //watchTags();
  //watchModel();
  //
  //// this stuff takes the parsed comprehension expression and
  //// makes a srcTags array full of tag objects out of it.
  //$scope.srcTags = [];
  //if (angular.isDefined($attrs.src)) {
  //  updateSrc();
  //} else {
  //  // if you didn't specify a src, you must be able to type in new tags.
  //  $scope.options.addable = true;
  //}
  //
  //// emit identifier
  //$scope.$id = ++id;
  //$scope.$emit('badwing.tags.initialized', {
  //  $id: $scope.$id,
  //  model: $scope.model
  //});
  //
};
TagsCtrl.$inject = ['$scope', '$timeout', '$q', '$tags', '$attrs', '$parse', '$element', '$log'];

tags.controller('TagsCtrl', TagsCtrl);
