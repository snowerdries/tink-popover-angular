'use strict';
(function(module) {
  try {
    module = angular.module('tink.popover');
  } catch (e) {
    module = angular.module('tink.popover', []);
  }
  module.directive( 'tinkPopover', ['$q','$templateCache','$http','$compile','$timeout','$window','$rootScope',function ($q,$templateCache,$http,$compile,$timeout,$window,$rootScope) {
  return {
    restrict:'EA',
    scope: true,
    compile: function compile( tElement, attrs ) {
      var fetchPromises = {};
      //to retrieve a template;
      function getTemplate(template) {
        // --- if the template already is in our app cache return it. //
        if (fetchPromises[template]){
          return fetchPromises[template];
        }
        // --- If not get the template from templatecache or http. //
        return (fetchPromises[template] = $q.when($templateCache.get(template) || $http.get(template))
          .then(function (res) {
            // --- When the template is retrieved return it. //
            if (angular.isObject(res)) {
              $templateCache.put(template, res.data);
              return res.data;
            }
            return res;
          }));
      }
      var theTemplate = null;
      if(attrs.tinkPopoverTemplate){
        theTemplate = getTemplate(attrs.tinkPopoverTemplate);
      }

      return {
        post: function postLink( scope, element, attributes ) {
          scope.$on('$destroy', function() {
                element.off('click');
                element.off('mouseenter');
                element.off('mouseleave');
                $(document).off('click');
                $window.removeEventListener('resize', onresizefunc);
                $window.removeEventListener('scroll', onscrollfunc);

            });

          var placement = attributes.tinkPopoverPlace;
          var align = attributes.tinkPopoverAlign;
          var arrow = attributes.tinkArrow;
          var trigger = 'click';
          var spacing = 2;

          var isOpen = null;
          if(trigger === 'click'){
            element.bind('click',function(){
              scope.$apply(function(){
                if(isOpen === null){
                  show();
                }else{
                  hide();
                }

              });
            });
          }else if(trigger === 'hover'){
            element.bind('mouseenter',function(){
              show();
            });
            element.bind('mouseleave',function(){
              hide();
            });
          }

          function popoverHtml(){
            var html = '<div class="popover {{arrowPlacement}}">'+
                       '<span class="arrow"></span>'+
                       '</div>';
            return html;
          }

          function childOf(c,p){ //returns boolean
            while((c=c.parentNode)&&c!==p){
            }
            return !!c;
          }

          $(document).bind('click',function(e){
            var clicked = $(e.target).parents('.popover').last();
            var group = $(e.target).attr('tink-popover-group');
            if(isOpen && !childOf($(e.target).get(0),element.get(0)) && ($(e.target).get(0) !== element.get(0) || clicked.length > 0)){
              if(isOpen.get(0) !== clicked.get(0) &&  $(e.target).get(0) !== isOpen.get(0) && attributes.tinkPopoverGroup !== group){
                hide();
              }
            }
          });

          if(attributes.tinkPopoverGroup){
            scope.$on('popover-open', function(event, args) {

              var group = args.group;
              if(group !== attributes.tinkPopoverGroup && isOpen && $(args.el).get(0) !== isOpen.get(0)){
                hide();
              }
            });
          }

          function show (){
            if(theTemplate !== null){
              theTemplate.then(function(data){
                if(isOpen === null){
                  var elContent =$($compile('<div>'+data+'</div>')(scope));
                  var el =$($compile(popoverHtml())(scope));
                  el.css('position','absolute');
                  el.css('visibility','hidden');
                  elContent.insertAfter(el.find('span'));

                  if(placement === 'top'){
                    element.before(el);
                  }else{
                    element.after(el);
                  }

                  el.css('top',-100);
                  el.css('left',-10);

                  calcPos(element,el,placement,align,spacing);

                  if(attributes.tinkPopoverGroup){
                    $rootScope.$broadcast('popover-open', { group: attributes.tinkPopoverGroup,el:el });
                  }

                  isOpen = el;
                }
              });
            }
          }

          var timeoutResize = null;

          $window.addEventListener('resize', function() {
            if(isOpen!== null){
              $timeout.cancel( timeoutResize);
              timeoutResize = $timeout(function(){
               // setPos(isOpen,placement,align,spacing);
                calcPos(element,isOpen,placement,align,spacing);
              },250);
            }
          }, true);

          $window.addEventListener('scroll', function() {
            if(isOpen!== null){
              $timeout.cancel( timeoutResize);
              timeoutResize = $timeout(function(){
                // setPos(isOpen,placement,align,spacing);
                calcPos(element,isOpen,placement,align,spacing);
              },450);
            }
          }, true);

          function hide(){
            if(isOpen !== null){
              isOpen.remove();
              isOpen = null;
            }
          }

          //The function that will be called to position the tooltip;
          function getPos(el,placement,align,spacing){

            var porcent = {right:0.85,left:0.15,top:0.15,bottom:0.85};

            // Default offset of the popover
            var arrowHeight = 0;
            var arrowWidth = 0;

            // If the popover has an arrow, change the default offset
            if (typeof arrow === 'undefined' || arrow === 'true') {
              arrowHeight = 10;
              arrowWidth = 10;
            }

            var alignLeft = 0;
            var alignTop = 0;
            if(align === 'center'){
              alignLeft = (el.outerWidth(true) / 2)-(element.outerWidth(true)/2);
              alignTop = 0;
            }else if(align === 'left' || align === 'right'){
              alignLeft = (el.outerWidth(true)*porcent[align]) -(element.outerWidth(true)/2);
            }else if(align === 'top' || align === 'bottom'){
              alignTop = 0;
            }

            var left = element.position().left - alignLeft;
            var top = null;
              if(placement === 'top'){
                top = element.position().top - (el.outerHeight() + arrowHeight +spacing);
              }else if(placement === 'bottom'){
                top = element.position().top + element.outerHeight() + arrowHeight +spacing;
              }else if(placement === 'right'){
                left = element.position().left + element.outerWidth(true) + arrowWidth + spacing;
              }else if(placement === 'left'){
                left = element.position().left - el.outerWidth(true)- arrowWidth - spacing;
              }

              if(align === 'right'){
                left = element.position().left + (element.outerWidth(true) - el.outerWidth(true));
              }else if(align === 'left'){
                left = element.position().left;
              }else if(align === 'top'){
                top = element.position().top;
              }else if(align === 'bottom'){
                top = element.position().top - el.outerHeight(true) + element.outerHeight(true);
              }else if(align === 'center'){
                if(placement === 'top' || placement === 'bottom'){
                  left = element.position().left - ((el.outerWidth(true) / 2)-(element.outerWidth(true)/2));
                }else if(placement === 'left' || placement === 'right'){
                  top = element.position().top - ((el.outerHeight(true) / 2)-(element.outerHeight(true)/2));
                }
              }

              return {top:top,left:left,place:placement,align:align};
            }

            function arrowCal(placement,align){
              // show or don't show arrow
              if (typeof arrow === 'undefined' || arrow === 'true') {
                var arrowCss = 'arrow-';
                switch(placement){
                  case 'left':
                    arrowCss = arrowCss + 'right';
                    break;
                  case 'right':
                    arrowCss = arrowCss + 'left';
                    break;
                  case 'top':
                    arrowCss = arrowCss + 'bottom';
                    break;
                  case 'bottom':
                    arrowCss = arrowCss + 'top';
                    break;
                }

                switch(align){
                  case 'center':
                    break;
                  case 'top':
                  case 'bottom':
                    if(placement === 'right' || placement === 'left'){
                      arrowCss = arrowCss + '-' + align;
                    }
                    break;
                  case 'left':
                  case 'right':
                    if(placement === 'top' || placement === 'bottom'){
                      arrowCss = arrowCss + '-' + align;
                    }
                }
                scope.arrowPlacement = arrowCss;
              }
            }
            arrowCal(placement,align);

            //calculate the position
            function calcPos(element,el,place,align,spacing){
              var pageScrollY = ($window.scrollY || $window.pageYOffset);
              var pageScrollX = ($window.scrollX || $window.pageXOffset);

              var w1 = element.offset().left - pageScrollX;
              var w2 = $window.innerWidth - (w1+element.outerWidth(true));
              var h1 = element.offset().top - Math.ceil(parseFloat($('body').css('padding-top'))) - pageScrollY;
              var h2 = $window.innerHeight - (h1+element.outerHeight(true));

              if(place){
                if(place==='top'){
                  if(el.outerHeight(true) + spacing + 10 > h1){
                    place = undefined;
                    align = undefined;
                  }
                }else if (place === 'bottom'){
                  if(el.outerHeight(true) + spacing + 10 > h2){
                    place = undefined;
                    align = undefined;
                  }
                }else if(place === 'left'){
                  if((el.outerWidth(true) - element.outerWidth(true)) > w1){
                    place = undefined;
                    align = undefined;
                  }
                }else if(place === 'right'){
                  if((el.outerWidth(true) - element.outerWidth(true)) > w2){
                    place = undefined;
                    align = undefined;
                  }
                }else{
                  place = undefined;
                  align = undefined;
                }
              }

              if(!place){
                if(h1 > element.outerHeight() || h2 > element.outerHeight()){
                  if(h1 > h2){
                    place = 'top';
                  }else{
                    place = 'bottom';
                  }
                }else if(w1 > element.outerWidth() || w2 > element.outerWidth()){
                  if(w1 > w2){
                    place = 'left';
                  }else {
                    place = ' right';
                  }
                }else{
                  place = 'bottom';
                }
              }
              var val;
              if(align){
                if(place === 'left' || place === 'right'){
                  if(align === 'top'){
                    if((el.outerHeight(true) - element.outerHeight(true))> h2){
                      align = undefined;
                    }
                  }else if(align === 'bottom'){
                    if((el.outerHeight(true) - element.outerHeight(true))> h1){
                      align = undefined;
                    }
                  }else if(align === 'center'){
                    val = (el.outerHeight(true) - element.outerHeight(true)) / 2;
                    if(val > h1 || val > h2){
                      align = undefined;
                    }
                  }

                }else if(place === 'top' || place === 'bottom'){
                  if(align === 'left'){
                    if((el.outerWidth(true) - element.outerWidth(true))> w2){
                      align = undefined;
                    }
                  }else if(align === 'right'){
                    if((el.outerWidth(true) - element.outerWidth(true))> w1){
                      align = undefined;
                    }
                  }else if(align === 'center'){
                    val = (el.outerWidth(true) - element.outerWidth(true))/2;
                    if(val > w1 || val > w2){
                      align = undefined;
                    }
                  }

                }
              }

              if(!align){
                if(place === 'left' || place === 'right'){
                  if(h1 > h2){
                    align = 'bottom';
                  }else {
                    align = 'top';
                  }
                }else if(place === 'top' || place === 'bottom'){
                  if(w1 > w2){
                    align  = 'right';
                  }else{
                    align = 'left';
                  }
                }
              }

              function calcPostInside(){
                var data = getPos(el,place,align,spacing);
                el.css('top',data.top);
                el.css('left',data.left);
                arrowCal(data.place,data.align);
              }

              // calcPostInside();

              $timeout(function(){
                calcPostInside();
                el.css('visibility','visible');
              },20);

              // Fix an early transition
              $timeout(function(){
                el.addClass('popover-transition');
              },250);
            }

          }
        };
      }
    };

  }]);
})();
;'use strict';
(function(module) {
  try {
    module = angular.module('tink.tooltip');
  } catch (e) {
    module = angular.module('tink.tooltip', []);
  }
  module.directive( 'tinkTooltip', ['$q','$templateCache','$http','$compile','$timeout','$window','$rootScope',function ($q,$templateCache,$http,$compile,$timeout,$window,$rootScope) {
  return {
    restrict:'EA',
    scope:{
      tinkTooltip:'@',
      tinkTooltipDisabled:'='
    },controller:function(){

      var ctrl = this;

      var fetchPromises = {};  
      ctrl.haalTemplateOp = function(template) {
        // --- if the template already is in our app cache return it. //
        if (fetchPromises[template]){
          return fetchPromises[template];
        }
        // --- If not get the template from templatecache or http. //
        return (fetchPromises[template] = $q.when($templateCache.get(template) || $http.get(template))
          .then(function (res) {
            // --- When the template is retrieved return it. //
            if (angular.isObject(res)) {
              $templateCache.put(template, res.data);
              return res.data;
            }
            return res;
          }));
      }

      /* popover html*/
      ctrl.popoverHtml = function(){
        return '<div class="tooltip {{arrowPlacement}}">'+
                    '<span class="arrow"></span>'+
                  '</div>';
      }

    },
   controllerAs:'ctrl', 
    compile: function compile( tElement, attrs ) {
      return {
          post: function postLink( scope, element, attributes,controller) {
              /*basic variables */
                var placement = attributes.tinkTooltipPlace;
                var align = attributes.tinkTooltipAlign;
                var trigger = attributes.tinkTooltipTrigger || 'hover';
                var spacing = 2;
                var isOpen = null;

              /* get template if there is one */     
                var theTemplate = null;
                if(attributes.tinkTooltipTemplate){
                  theTemplate = controller.haalTemplateOp(attributes.tinkTooltipTemplate);
                }

                scope.$parent.$watch(attributes.ngDisabled, function(newVal){
                    if(true){
                      hide();
                    }
                });

                /* see wich trigger we are goind to use */    
                if(trigger === 'click'){
                  element.bind('click',function(){
                    scope.$apply(function(){
                      if(isOpen === null){
                        show();
                      }else{
                        hide();
                      }

                    });
                  });
                }else if(trigger === 'hover'){
                   element.bind('mouseenter',function(){
                    show();
                   });
                   element.bind('mouseleave',function(){
                    hide();
                   });
                }

                           

              function childOf(c,p){ //returns boolean
                while((c=c.parentNode)&&c!==p){
                }
                return !!c;
              }


              function toon(data){
                var elContent = $($compile(data)(scope));
                var el = $($compile(controller.popoverHtml())(scope));
                el.css('position','absolute');
                el.css('visibility','hidden');
                elContent.insertAfter(el.find('span'));

                if(align === 'top'){
                  element.before(el);
                }else{
                  element.after(el);
                }
                el.css('top',element.position().top)
                calcPos(element,el,attrs.tinkTooltipAlign,align,spacing);

                if(trigger === 'click'){
                  el.append($($compile('<a href="#" class="close" ng-click="close($event)">Sluiten</a>')(scope)));
                }

                if(attributes.tinkPopoverGroup){
                  $rootScope.$broadcast('popover-open', { group: attributes.tinkPopoverGroup,el:el });
                }

                isOpen = el;
              }

              function show (){
                if(scope.tinkTooltipDisabled === false || scope.tinkTooltipDisabled === 'false' || scope.tinkTooltipDisabled === undefined || scope.tinkTooltipDisabled === null){
                  if(theTemplate !== null){
                    theTemplate.then(function(data){
                      if(isOpen === null){
                        toon(data);
                      }
                    });
                  }else{
                    if(isOpen === null){
                      toon($('<span>{{tinkTooltip}}</span>'));
                    }
                  }
                }
              }

              var timeoutResize = null;

              $window.addEventListener('resize', function() {
                if(isOpen!== null){
                  $timeout.cancel( timeoutResize);
                  timeoutResize = $timeout(function(){
                   // setPos(isOpen,placement,align,spacing);
                    calcPos(element,isOpen,attrs.tinkTooltipAlign,align,spacing);
                  },250);
                }
              }, true);

              $window.addEventListener('scroll', function() {
                if(isOpen!== null){
                  $timeout.cancel( timeoutResize);
                  timeoutResize = $timeout(function(){
                   // setPos(isOpen,placement,align,spacing);
                    calcPos(element,isOpen,attrs.tinkTooltipAlign,align,spacing);
                  },450);
                }
              }, true);

              function hide(){
                if(isOpen !== null){
                  isOpen.remove();
                  isOpen = null;
                }
              }

              scope.close = function(event){
                hide();
                event.preventDefault();
                event.stopPropagation();
              }

                 //The function that will be called to position the tooltip;
            function getPos(el,placement,align,spacing){


                var porcent = {right:0.85,left:0.15,top:0.15,bottom:0.85};
                var arrowHeight = 10;
                var arrowWidth = 10;

                var alignLeft = 0;
                var alignTop = 0;
                if(align === 'center'){
                  alignLeft = (el.outerWidth(true) / 2)-(element.outerWidth(true)/2);
                  alignTop = 0;
                }else if(align === 'left' || align === 'right'){
                  alignLeft = (el.outerWidth(true)*porcent[align]) -(element.outerWidth(true)/2);
                }else if(align === 'top' || align === 'bottom'){
                  alignTop = 0;
                }

                var left = element.position().left - alignLeft;
                var top = null;
                  if(placement === 'top'){
                    top = element.position().top - (el.outerHeight() + arrowHeight +spacing);
                  }else if(placement === 'bottom'){
                    top = element.position().top + element.outerHeight() + arrowHeight +spacing;
                  }else if(placement === 'right'){
                    left = element.position().left + element.outerWidth(true) + arrowWidth + spacing;
                  }else if(placement === 'left'){
                    left = element.position().left - el.outerWidth(true) - arrowWidth - spacing;
                  }

                  if(align === 'right'){
                    left = element.position().left + (element.outerWidth(true) - el.outerWidth(true));
                  }else if(align === 'left'){
                    left = element.position().left;
                  }else if(align === 'top'){
                    top = element.position().top;
                  }else if(align === 'bottom'){
                    top = element.position().top - el.outerHeight(true) + element.outerHeight(true);
                  }else if(align === 'center'){
                    if(placement === 'top' || placement === 'bottom'){
                      left = element.position().left - ((el.outerWidth(true) / 2)-(element.outerWidth(true)/2));
                    }else if(placement === 'left' || placement === 'right'){
                      top = element.position().top - ((el.outerHeight(true) / 2)-(element.outerHeight(true)/2));
                    }
                  }


                    return {top:top,left:left,place:placement,align:align};

            }


              function arrowCal(align){
                  var arrowCss = 'arrow-';

                  switch(align){
                    case 'left':
                      arrowCss = arrowCss + 'right';
                      break;
                    case 'right':
                      arrowCss = arrowCss + 'left';
                      break;
                    case 'top':
                      arrowCss = arrowCss + 'bottom-left';
                      break;
                    case 'bottom':
                      arrowCss = arrowCss + 'top-left';
                      break;
                  }

                  scope.arrowPlacement = arrowCss;
                }
              arrowCal(placement,align);

              //calculate the position
              function calcPos(element,el,place,align,spacing){
                switch(place){
                    case 'left':
                      align = 'center';
                      break;
                    case 'right':
                      align = 'center';
                      break;
                    case 'top':
                      align = 'left';
                      break;
                    case 'bottom':
                      align = 'left';
                      break;
                  }
                function calcPostInside(){
                  var data = getPos(el,place,align,spacing);
                    el.css('top',data.top);
                    el.css('left',data.left);
                    arrowCal(data.place);
                }
                $timeout(function(){
                  calcPostInside();
                  el.css('visibility','visible');
                },25);

                
              }

          }
      };
    }
  };

}]);
})();
;angular.module('tink.tooltip').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/tem.html',
    "<div> Als je de schrijfwijze van een naam niet goed kent of je hebt maar een gedeelte van de naam die je zoekt, kan je fonetisch zoeken inschakelen. Je zal dan niet alleen exacte resultaten krijgen, maar ook namen die gelijkaardig zijn aan de zoektermen die je opgeeft. <div class=margin-top> <cite>TIP: vervang letters die je niet kent door een sterretje (*) !</cite> </div> </div>"
  );

}]);
