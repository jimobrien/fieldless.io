( function (fieldless) {

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