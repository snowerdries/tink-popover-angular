'use strict';
describe('tink-popover-angular', function() {

  var bodyEl = $('body'), sandboxEl;
  var $compile, $templateCache, scope;

  beforeEach(module('tink.popover'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $templateCache = _$templateCache_;
    sandboxEl = $('<div>').attr('id', 'sandbox').appendTo(bodyEl);
    $templateCache.put('views/modal-template.html','testo');
  }));

  afterEach(function() {
    scope.$destroy();
    sandboxEl.remove();
  });

  function compileDirective(template, locals) {
    template = templates[template];
    angular.extend(scope, angular.copy(template.scope || templates['default'].scope), locals);
    var element = $(template.element).appendTo(sandboxEl);
    element = $compile(element)(scope);
    scope.$digest();
    return jQuery(element[0]);
  }

  var templates = {
    'click': {
      scope: {},
      element: '<button popover-placement="left"  tink-popover-template="views/modal-template.html" tink-popover >Open tooltip</button>'
    }
  };


  describe('popup should show', function() {
    it('on click',function(){
      var element = compileDirective('click',{position:'left'});
      element.click();
      scope.$digest();
      console.log(sandboxEl.find('.popover')[0])
    });
  });

});