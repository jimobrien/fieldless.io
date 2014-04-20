( function (fieldless) {

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

			obj = cleanseData(obj);

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
			this.relName  = TagFactory.generate('RelName', obj.relName);
			this.relLabel = TagFactory.generate('RelLabel', obj.relName);
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
			this.relName  = TagFactory.generate('RelName', obj.relName);
			this.relLabel = TagFactory.generate('RelLabel', obj.relName);
			this.refTo    = TagFactory.generate('RefTo', obj.lookupObject);
			this.relOrder = TagFactory.generate('RelOrder', relationshipOrderCount);
			this.mastRead = TagFactory.generate('MastRead', obj.mastRead || false);

			relationshipOrderCount++;
		};


		FieldFactory.Percent  = FieldFactory.Number;
		FieldFactory.Currency = FieldFactory.Number;

		function cleanseData (obj) {
			// strip __c incase it was included by user
			if (obj.relName) {
				obj.relName = obj.relName.replace("__c", ""); 
			}

			return obj;
		}


		return FieldFactory;

	}]);

}(window.fieldless));