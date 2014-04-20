( function (fieldless) {

	fieldless.controller('main', ['$scope', 'FormServ', 'FieldFactory', 'FieldServ', function ($scope, FormServ, FieldFactory, FieldServ) {

		$scope.field     = {}; // field model
		$scope.fields    = []; // array to store new fields
		$scope.fieldXML  = []; // XML shown in output panel
		// $scope.fieldForm = {}; // form model

		$scope.formFields = FormServ.fields;

		$scope.toggleFields = function (field) {
			if (field === 'type') {
				var ftype  = $scope.field.type.toLowerCase();
				FieldServ.toggleVisibility($scope.formFields, ftype);
				FieldServ.setFieldValidation(ftype, $scope.formFields);
				FieldServ.setFieldDefaults($scope.field);
			}
		};

		$scope.$watch('field.type', function (newVal, oldVal) {
			if (newVal) {
				$scope.field = FieldServ.setFieldDefaults($scope.field);
			}
		});

		$scope.$watch('fields', function (newVal, oldVal) {
			if (newVal.length > 0 && oldVal.length > 0) {
				if (newVal.length === oldVal.length) { // if edit is made to existing item in field list
					$scope.fieldXML = FieldServ.refreshFieldXML(newVal, oldVal);
				}
			}
		}, true);

		$scope.create = function () {

			var field;
			var fieldtype = $scope.field.type.split(' ').join('');

			$scope.field.xml = FieldFactory.create(fieldtype, $scope.field).xml();

			$scope.fields.push($scope.field);
			$scope.fieldXML = FieldServ.flattenXML($scope.fields);
			$scope.field = {}; // reset field 

			if ($scope.fieldForm) 
				$scope.fieldForm.$setPristine(); // reset form to pristine state

			FormServ.toggleVisibility('hide');

		};

		$scope.remove = function (index) {
			$scope.fields.splice(index, 1);
			$scope.fieldXML = FieldServ.flattenXML($scope.fields);
		};

		$scope.setValidation = function (val) {

		};

		/**
		 * Select all content within a given div
		 * @param  {String} objId The id of the container
		 */
		$scope.selectAll = function (objId) {
			var range;

			deselectAll();

			if (document.selection) {
				range = document.body.createTextRange();
				range.moveToElementText(document.getElementById(objId));
				range.select();
			} else if (window.getSelection) {
				range = document.createRange();
				range.selectNode(document.getElementById(objId));
				window.getSelection().addRange(range);
			}

			function deselectAll() {

				if (document.selection){ 
					document.selection.empty(); 
				} else if (window.getSelection) {
					window.getSelection().removeAllRanges();
				}

			}
		};


	}]);
}(window.fieldless));