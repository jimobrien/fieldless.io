function isEmpty(value) {
	return angular.isUndefined(value) || value === '' || value === null || value !== value;
}

( function (w) {

	w.fieldless = angular.module('fieldless', ['ngRoute', 'ui.bootstrap', 'xeditable', 'hljs']);

	// set xeditable theme to bs3
	w.fieldless.run( function (editableOptions) {
		editableOptions.theme = 'bs3'; 
	});

	w.fieldless.config(['$routeProvider', 'hljsServiceProvider', function ($routeProvider, hljsServiceProvider) {
		$routeProvider
		.when('/', { 
			title: ' Fieldless - Create Salesforce objects faster! ',
			templateUrl: 'views/main.tpl.html', 
			controller: 'main'
		})
		.otherwise('/');
		
		hljsServiceProvider.setOptions({
			tabReplace: '    ' // replace tab with 4 spaces
		});
	}]);
	
}).apply(this, (typeof document !== "undefined") ? [window] : [] );;( function (fieldless) {

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
				FieldServ.setFieldValidation($scope.field.type, $scope.formFields);
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
}(window.fieldless));;( function (fieldless) {

    fieldless.directive('ngMax', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attr, ctrl) {
                scope.$watch(attr.ngMax, function(){
                    ctrl.$setViewValue(ctrl.$viewValue);
                });
                var maxValidator = function(value) {
                  var max = scope.$eval(attr.ngMax) || Infinity;
                  if (!isEmpty(value) && value > max) {
                    ctrl.$setValidity('ngMax', false);
                    return undefined;
                  } else {
                    ctrl.$setValidity('ngMax', true);
                    return value;
                  }
                };

                ctrl.$parsers.push(maxValidator);
                ctrl.$formatters.push(maxValidator);
            }
        };
    });

}(window.fieldless));

;( function (fieldless) {

    fieldless.directive('ngMin', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attr, ctrl) {
                scope.$watch(attr.ngMin, function(){
                    ctrl.$setViewValue(ctrl.$viewValue);
                });
                var minValidator = function(value) {
                  var min = scope.$eval(attr.ngMin) || 0;
                  if (!isEmpty(value) && value < min) {
                    ctrl.$setValidity('ngMin', false);
                    return undefined;
                  } else {
                    ctrl.$setValidity('ngMin', true);
                    return value;
                  }
                };

                ctrl.$parsers.push(minValidator);
                ctrl.$formatters.push(minValidator);
            }
        };
    });
    
}(window.fieldless));

;( function (fieldless) {

	fieldless.factory('FieldFactory', [ 'TagFactory', function (TagFactory) {

		var relationshipOrderCount = 0;

		function FieldFactory () {}

		FieldFactory.prototype.xml = function () {
			var innerXml = [];
			var output = ['<fields>\r\n', null, '</fields>'];

			for (var prop in this) {
				if (this.propertyIsEnumerable(prop)) {
					innerXml.push(this[prop].join('') + '\r\n');
				}
			}

			output[1] = '\t' + innerXml.join('\t').replace(/,/g,''); // indent the inner xml contents. Commas are inserted randomly, not sure why, but replace..

			return output.join('');
		};

		// factory method
		FieldFactory.create = function (type, obj) {
			var constr = type,
				newfield;

			// if constr doesnt exist
			if (typeof FieldFactory[constr] !== 'function') {
				newfield = new FieldFactory(obj); // create basic tags
			} else {
				if (typeof FieldFactory[constr].prototype.xml !== 'function') {
					FieldFactory[constr].prototype = new FieldFactory();
				}
				newfield = new FieldFactory[constr](obj);
			}

			if (obj && obj.name) {
				newfield.label = TagFactory.generate('Label', obj.name);
				newfield.fullName = TagFactory.generate('FullName', obj.name); 
			}

			if (obj.required) { 
				newfield.isRequired = TagFactory.generate('Required', obj.required);
			}
			
			if (obj.description) {
				newfield.description = TagFactory.generate('Description', obj.description);
			}

			// if the type isn't set through the specific constructor, set it now.
			if (!newfield.type) { 
				newfield.type = TagFactory.generate('Type', type);
			}
			return newfield;

		};


		FieldFactory.Text = function (obj) {
			this.len = TagFactory.generate('Length', obj.length);
		};


		FieldFactory.Url = function (obj) {
			this.defaultVal = TagFactory.generate('DefaultValue', obj.defaultValue);
		};


		FieldFactory.Formula = function (obj) {
			this.formula = TagFactory.generate('Formula', obj.formula);
			this.type    = TagFactory.generate('Type', obj.dataType);

			if (obj.dataType === 'Number') {
				this.precision = TagFactory.generate('Precision', 18); //obj.precision);
				this.scale     = TagFactory.generate('Scale', 2); //obj.scale);
			} else if (obj.dataType === 'Currency') {
				this.precision = TagFactory.generate('Precision', 18);
				this.scale     = TagFactory.generate('Scale', 2);
			}
		};


		FieldFactory.Picklist = function (obj) {
			this.picklistValues = TagFactory.generate('PicklistValues', obj.picklistValues);
		};

		FieldFactory.MultiselectPicklist = function (obj) {
			this.picklistValues = TagFactory.generate('PicklistValues', obj.picklistValues);
			this.visLines = TagFactory.generate('VisibleLines', obj.visibleLines);
		};


		FieldFactory.RichTextArea = function (obj) {
			this.type = TagFactory.generate('Type', 'Html');
			this.visLines = TagFactory.generate('VisibleLines', obj.visibleLines);
			this.len = TagFactory.generate('Length', obj.length);
		};


		FieldFactory.LongTextArea = FieldFactory.RichTextArea;


		FieldFactory.Lookup = function (obj) {
			this.relName  = TagFactory.generate('RelName', obj.sfobject);
			this.relLabel = TagFactory.generate('RelLabel', obj.sfobject);
			this.refTo    = TagFactory.generate('RefTo', obj.lookupObject);
		};


		FieldFactory.Number = function (obj) {
			this.precision = TagFactory.generate('Precision', 18); //obj.precision);
			this.scale     = TagFactory.generate('Scale', 2); //obj.scale);
		};

		FieldFactory.Currency = function (obj) {
			this.precision = TagFactory.generate('Precision', 18);
			this.scale     = TagFactory.generate('Scale', 2);
		};


		FieldFactory.MasterDetail = function (obj) {
			this.relName  = TagFactory.generate('RelName', obj.sfobject);
			this.relLabel = TagFactory.generate('RelLabel', obj.sfobject);
			this.refTo    = TagFactory.generate('RefTo', obj.lookupObject);
			this.relOrder = TagFactory.generate('RelOrder', relationshipOrderCount);
			this.mastRead = TagFactory.generate('MastRead', obj.mastRead || false);

			relationshipOrderCount++;
		};


		FieldFactory.Percent = FieldFactory.Number;

		FieldFactory.Currency = FieldFactory.Number;

		return FieldFactory;

	}]);

}(window.fieldless));;( function (fieldless) {

	fieldless.factory('TagFactory', [ function TagFactory() {

		var self = this;

		// factory method
		self.generate = function (type, val) {

			var constr = type,
				tag;

			// error if constr doesnt exist
			if (typeof self[constr] !== 'function') {
				error();
			} else {
				tag = new self[constr](val);
			}

			return tag;

		};

		self.Type = function (type) {
			return ['<type>', type, '</type>'];
		};

		self.Label = function (fieldName) {
			return ['<label>', fieldName, '</label>'];
		};

		self.FullName = function (fieldName) {
			var fullName;
			if (fieldName) {
				fullName = fieldName.split(' ').join('_') + '__c';
				return ['<fullName>', fullName, '</fullName>'];
			} else {
				error({}, fieldName);
			}
		};

		self.Length = function (num) {
			return ['<length>', num, '</length>'];
		};

		self.VisibleLines = function (num) {
			return ['<visibleLines>', num,'</visibleLines>'];	
		};

		self.RelLabel = function (label) {
			return ['<relationshipLabel>',label,'</relationshipLabel>'];	
		};

		self.RelName = function (name) {
			return ['<relationshipName>',name,'</relationshipName>'];	
		};

		self.RefTo = function (referenceObjName) {
			return ['<referenceTo>', referenceObjName, '</referenceTo>'];	
		};

		self.RelOrder = function (num) {
			return ['<relationshipOrder>', num, '</relationshipOrder>'];	
		};

		self.MastRead = function (bool) {
			return ['<writeRequiresMasterRead>', bool || false, '</writeRequiresMasterRead>'];	
		};

		self.Formula = function (formulaStr) {
			var safeStr = formulaStr.replace(/&/g, "&amp;")
									.replace(/>/g, "&gt;")
									.replace(/</g, "&lt;")
									.replace(/"/g, "&quot;")
									.replace(/'/g, "&apos;");

			return ['<formula>', safeStr, '</formula>'];	
		};

		self.Precision   = function (num) {
			return ['<precision>',num,'</precision>'];	
		};

		self.Scale = function (num) {
			return ['<scale>',num,'</scale>'];	
		};

		self.PicklistValues = function (valStr) {

			var valsArr = valStr.split('\n'),
				valName,
				defVal,
				vals = [],
				val;

			for (var i = 0; i < valsArr.length; i++) {
				if (valsArr[i].indexOf('*') > -1) { // if asterisk, it's the default val
					valName = self.ValName(valsArr[i].split('*').join(''));
					defVal  = self.DefaultPicklistVal(true);
				} else {
					valName = self.ValName(valsArr[i]);
					defVal  = self.DefaultPicklistVal(false);
				}

				val = '\t\t<picklistValues>\r\n\t' + valName.join('') + '\t' + defVal.join('') + '\t\t</picklistValues>\r\n';
				vals.push(val);
			}
			return ['<picklist>\r\n', vals, '\t</picklist>'];
		};

		self.DefaultPicklistVal  = function (bool) {
			return ['\t\t<default>', bool || false, '</default>\r\n'];	
		};

		self.Description  = function (bool) {
			return ['<description>', bool || false, '</description>'];	
		};

		self.ValName = function (name) {
			return ['\t\t<fullName>', name, '</fullName>\r\n'];
		};

		self.ExternalId = function (bool) {
			return ['<externalId>', bool || false, '</externalId>'];
		};

		self.DefaultValue = function (bool) { 
			return ['<defaultValue>', bool || false, '</defaultValue>'];
		};

		self.Required = function (bool) {
			return ['<required>', bool || false, '</required>'];
		};


		function error (obj, prop) {
			throw {
				name: "Error",
				message: "Error: " + obj + " " + prop
			};
		}

		return self;
	
	}]);

}(window.fieldless));;( function (fieldless) {

	fieldless.service('FieldServ', [ 'FieldFactory', function FieldServ (FieldFactory) {

		var self = this;

		self.toggleVisibility = function (formFields, newfieldType) {

			var fields = formFields, 
				ftype  = newfieldType,
				showField, 
				f;

			for (f in fields) {

				if (fields[f].showFor && fields[f].show !== 'always') {
					
					if (fields[f].showFor instanceof Array) {
						showField = fields[f].showFor.map(toLowerCase).indexOf(ftype) > -1 ? true : false;
					} else {
						showField = fields[f].showFor.toLowerCase().indexOf(ftype.toLowerCase())  > -1;	
					}

					if (showField)
						fields[f].show = true;
					else 
						fields[f].show = false;
					
				}

			}

			function toLowerCase (item) { 
				return item.toLowerCase(); 
			}

			return formFields;

		};

		self.setFieldDefaults = function (field) {

			if (field.type.indexOf('Text') > -1) {

				if (field.type.indexOf('Area') > -1) {
					
					field.length = 32768;
					field.visibleLines = 10;

				} else {
					
					field.length = 255;

				}

			} else if (field.type === 'Number') {
				
				field.precision = 18;

			} else if ( field.type === 'MultiselectPicklist') {
				field.visibleLines = 5;
			}
			

			return field;

		};

		self.setFieldValidation = function (fieldType, formFields) {
			var f,
			fieldValidations = {
				visibleLines: {
					name: 'visibleLines'
				},
				flength: {
					name: 'length'
				}
			},
			validationSettings = {
				formFields: formFields || [],
				validations: []
			};

			if (typeof fieldType === 'string') {

				if (fieldType.indexOf('Area') > -1) {
					fieldValidations.visibleLines.rules = { min: 10, max: 1000 };
					fieldValidations.flength.rules      = { min: 1, max: 32768 };
					validationSettings.validations.push(fieldValidations.visibleLines, fieldValidations.flength);

				} else if (fieldType === 'Text') {
					fieldValidations.flength.rules = { min: 1, max: 255 };
					validationSettings.validations.push(fieldValidations.flength);
				} else if  (fieldType === 'MultiselectPicklist') {
					fieldValidations.visibleLines.rules = { min: 1, max: 1000 };
				}

				setValidation(validationSettings);
			}

			function setValidation (config) {
				var i, j, fieldsLen, valsLen;

				if (config.validations.length > 0) {
					valsLen   = config.validations.length;
					fieldsLen = config.formFields.length;
					for (i =0; i < valsLen; i++) {
						for (j = 0; j < fieldsLen; j+=1) {
							if (config.validations[i].name.toLowerCase() === config.formFields[j].name.toLowerCase()) {
								config.formFields[j].validation = config.validations[i].rules;
							}
						}
					}
				}
			} 

		};

		self.refreshFieldXML  = function (newFields, oldFields) {
			var xml;
			for (var i = 0; i < newFields.length; i++) {
				if (newFields[i].name !== oldFields[i].name) {
					newFields[i].xml = FieldFactory.create(newFields[i].type, newFields[i]).xml();
				}
			}

			xml = self.flattenXML(newFields);

			return xml;
		};

		self.flattenXML = function (arr) {
			var flat;
			flat = $.map(arr, function(field){ return field.xml; }).join('\r\n');
			return flat;
		};


	}]);

}(window.fieldless));;( function (fieldless) {

	fieldless.service('FormServ', [ function FormServ() {
		var self = this;

		self.toggleVisibility = function (toggler) {

			toggler = toggler ? toggler.toLowerCase() : false;

			if (toggler) {
				toggle(toggler);
			} else { 
				toggle();
			}

			function toggle (togg) {
				var f;

				for (f in self.fields) {

					if (self.fields[f].show !== 'always') {
						if (togg === 'show') {
							self.fields[f].show = true;
						} else if (togg === 'hide') {
							self.fields[f].show = false;
						} else {
							self.fields[f].show = !self.fields[f].show;
						}
					}
					
				}
			}
 		};

 		self.fields = [
				{
					name: 'name',
					label: 'Name',
					type: 'text',
					show: 'always',
					placeholder: 'Your field name'
				},
				{
					name: 'type',
					label: 'Type',
					type: 'select',
					show: 'always',
					selectType: 'text',
					selectOptions: [
						{ 
							name: "Text",
							value: "Text"
						},
						{ 
							name: "Text Area",
							value: "TextArea" 
						},
						{ 
							name: "Long Text Area",
							value: "LongTextArea",
						},
						{ 
							name: "Rich Text Area",
							value: "RichTextArea" 
						},
						{ 
							name: "Formula",
							value: "Formula"
						},
						{ 
							name: "Number",
							value: "Number" 
						},
						{ 
							name: "Currency",
							value: "Currency" 
						},
						{ 
							name: "Percent",
							value: "Percent" 
						},
						{ 
							name: "Checkbox",
							value: "Checkbox" 
						},
						{ 
							name: "Date",
							value: "Date" 
						},
						{ 
							name: "DateTime",
							value: "DateTime" 
						},
						{ 
							name: "Url",
							value: "Url" 
						},
						{ 
							name: "Phone",
							value: "Phone" 
						},
						{ 
							name: "Picklist",
							value: "Picklist" 
						},
						{ 
							name: "Multiselect Picklist",
							value: "MultiselectPicklist" 
						},
						{ 
							name: "Lookup",
							value: "Lookup" 
						},
						{ 
							name: "Master Detail",
							value: "MasterDetail"
						}
					],
					placeholder: ''
				},
				{
					name: 'description',
					label: 'Description',
					type: 'textarea',
					show: 'always',
					placeholder: 'What is this field for?'
				},
				{
					name: 'dataType',
					label: 'Data Type',
					type: 'select',
					selectType: 'text',
					selectOptions: [
						{
							name: 'Text',
							value: 'Text'
						},
						{
							name: 'Number',
							value: 'Number'
						},
						{
							name: 'Currency',
							value: 'Currency'
						}
					],
					show: false,
					showFor: 'Formula',
					placeholder: ''
				},
				{
					name: 'externalId',
					label: 'External Id',
					type: 'checkbox',
					show: false,
					showFor: '',
					placeholder: ''
				},
				{
					name: 'length',
					label: 'Length',
					type: 'number',
					show: false,
					validation: { },
					showFor: ['Text', 'RichTextArea', 'LongTextArea'],
					placeholder: ''
				},
				{
					name: 'sfobject',
					label: 'Object',
					type: 'text',
					show: false,
					showFor: ['MasterDetail', 'Lookup'],
					placeholder: 'The object the field is being created on'
				},
				{
					name: 'lookupObject',
					label: 'Lookup Object',
					type: 'text',
					show: false,
					showFor: ['MasterDetail', 'Lookup'],
					placeholder: 'The lookup object'
				},
				{
					name: 'formula',
					label: 'Formula',
					type: 'textarea',
					show: false,
					showFor: 'Formula',
					placeholder: ''
				},
				{
					name: 'picklistValues',
					label: 'Picklist Values',
					type: 'textarea',
					show: false,
					showFor: ['Picklist', 'MultiselectPicklist'],
					placeholder: 'List each item on a separate line'
				},
				{
					name: 'visibleLines',
					label: 'Visible Lines',
					type: 'number',
					show: false,
					validation: {},
					showFor: ['RichTextArea', 'LongTextArea', 'MultiselectPicklist'],
					placeholder: ''
				},
				{
					name: 'required',
					label: 'Required',
					type: 'checkbox',
					show: 'always',
					placeholder: ''
				},
				{
					name: 'defaultValueBoolish',
					label: 'Default Value',
					type: 'radio',
					options: ['True', 'False'],
					show: false,
					showFor: 'Checkbox',
				},
		];

	}]);

}(window.fieldless));