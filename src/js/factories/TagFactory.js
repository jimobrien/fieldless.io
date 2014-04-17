( function (fieldless) {

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

}(window.fieldless));