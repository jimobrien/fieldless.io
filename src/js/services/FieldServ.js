( function (fieldless) {

	fieldless.service('FieldServ', [ 'FieldFactory', function FieldServ (FieldFactory) {

		var self = this;

		self.toggleVisibility = function (formFields, newfieldType) {

			var fields = formFields, 
				ftype  = newfieldType,
				showField, 
				f;

			for (f in fields) {

				if (fields[f].show !== 'always') {

					if (fields[f].showFor) {
						
						if (fields[f].showFor instanceof Array) {
							showField = fields[f].showFor.map(toLowerCase).indexOf(ftype) > -1 ? true : false;
						} else {
							showField = fields[f].showFor.toLowerCase().indexOf(ftype.toLowerCase())  > -1;	
						}
						
					} else if (fields[f].showForExcept) {
						if (fields[f].showForExcept instanceof Array) {
							showField = fields[f].showForExcept.map(toLowerCase).indexOf(ftype) < 0 ? true : false;
						} else {
							showField = fields[f].showFor.toLowerCase().indexOf(ftype.toLowerCase()) < 0;	
						}
					}

					if (showField) {
						fields[f].show = true;
					} else {
						fields[f].show = false;
					}

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

}(window.fieldless));