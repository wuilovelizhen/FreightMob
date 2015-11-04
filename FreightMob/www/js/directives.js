var appDirectives = angular.module('MobileAPP.directives', []);

appDirectives.directive('dateFormat', ['$filter', function ($filter) {
    var dateFilter = $filter('date');
    return {
        require: 'ngModel',
        link: function (scope, element, attrs,ctrl) {
            function formatter(value) {
                return dateFilter(value, "yyyy-MM-dd HH:mm");
            }
            function parser() {
                return ctrl.$modelValue;
            }
            ctrl.$formatters.push(formatter);
            ctrl.$parsers.unshift(parser);
        }
    };
}]);

appDirectives.directive('uiSelectAll', ['$filter', function ($filter) {
    return {
        restrict: 'E',
        template: '<input type="checkbox">',
        replace: true,
        link: function (scope, iElement, iAttrs) {
            function changeState(checked, indet) {
                iElement.prop('checked', checked).prop('indeterminate', indet);
            }
            function updateItems() {
                angular.forEach(scope.$eval(iAttrs.items), function (el) {
                    el[iAttrs.prop] = iElement.prop('checked');
                });
            }
            iElement.bind('change', function () {
                scope.$apply(function () { updateItems(); });
            });
            scope.$watch(iAttrs.items, function (newValue) {
                var checkedItems = $filter('filter')(newValue, function (el) {
                    return el[iAttrs.prop];
                });
                switch (checkedItems ? checkedItems.length : 0) {
                    case 0:                // none selected
                        changeState(false, false);
                        break;
                    case newValue.length:  // all selected
                        changeState(true, false);
                        break;
                    default:               // some selected
                        changeState(false, true);
                }
            }, true);
            updateItems();
        }
    };
}]);

appDirectives.directive('ionMdInput', function () {
    return {
        restrict: 'E',
        replace: true,
        require: '?ngModel',
        template:
        '<label class="item item-input item-md-label">' +
        '<input type="text">' +
        '<span class="input-label"></span>' +
        '<div class="highlight"></div>' +
        '</label>',
        compile: function (element, attr) {

            var highlight = element[0].querySelector('.highlight');
            var highlightColor;

            if (!attr.highlightColor) {
                highlightColor = 'calm';
            } else {
                highlightColor = attr.highlightColor;
            }

            highlight.className += ' highlight-' + highlightColor;

            var label = element.find('span');
            label.html(attr.placeholder);

            var input = element.find('input');
            input.bind('blur', function () {
                console.log('blur')
                if (input.val())
                    input.addClass('used');
                else
                    input.removeClass('used');
            });
            angular.forEach({
                'name': attr.name,
                'type': attr.type,
                'ng-value': attr.ngValue,
                'ng-model': attr.ngModel,
                'required': attr.required,
                'ng-required': attr.ngRequired,
                'ng-minlength': attr.ngMinlength,
                'ng-maxlength': attr.ngMaxlength,
                'ng-pattern': attr.ngPattern,
                'ng-change': attr.ngChange,
                'ng-trim': attr.trim,
                'ng-blur': attr.ngBlur,
                'ng-focus': attr.ngFocus,
            }, function (value, name) {
                if (angular.isDefined(value)) {
                    input.attr(name, value);
                }
            });
            var cleanUp = function () {
                ionic.off('$destroy', cleanUp, element[0]);
            };
            ionic.on('$destroy', cleanUp, element[0]);
        }
    };
});