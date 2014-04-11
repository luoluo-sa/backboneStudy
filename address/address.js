$(function(){
	var address = Backbone.Model.extend({
		defaults: function(){
			return {
				showName: '',
				name: 'empty name ...',
				company: 'company name ...',
				phone: 'phone name ...',
				house: 'house name ...',
				email: 'email name ...'
			};
		}
	});

	var addressList = Backbone.Collection.extend({
		model: address,
		localStorage: new Backbone.LocalStorage('address-book'),
		comparator: 'showName'
	});

	var addresses = new addressList;

	var addressView = Backbone.View.extend({
		tagName: 'li',
		template: _.template($('#address-template').html()),
		events: {
			'click .delOne': 'delAddress',
			'click label': 'editAddress'
		},
		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
		},
		render: function(){
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},
		delAddress: function(){
			this.model.destroy();
			if(!addresses.length){
				app.$main.slideUp(200);
			}
		},
		editAddress: function(){
			var modelObj = this.model.toJSON();
			for(var i=0; i<app.attrLen; i++){
				var x = app.attrList[i];
				if(!!modelObj[x]){
					app['$'+x].val(modelObj[x]);
				}
			}
			app.$save.attr('type','update');
			this.delAddress();
			app.addAddress();
		}
	});

	var appView = Backbone.View.extend({
		el: $('#address'),
		events: {
			'click #addAddress': 'addAddress',
			'click #cancel': 'cancelAddress',
			'click #save': 'saveAddress',
			'keyup #searchInput': 'searchInput'
		},
		initialize: function(){
			this.attrList = ['name','company','phone','house','email'];
			this.attrLen = this.attrList.length;
			this.$addressWrap = this.$('#addressWrap');
			this.$amendAddress = this.$('#amendAddress');
			this.$save = this.$('#save');
			this.$name = this.$('#name');
			this.$company = this.$('#company');
			this.$phone = this.$('#phone');
			this.$house = this.$('#house');
			this.$email = this.$('#email');
			this.listenTo(addresses, 'sort', this.sortFun);
			this.listenTo(addresses, 'add', this.addOne);
			this.$searchInput = this.$('#searchInput');
			this.$main = this.$('#main');
			addresses.fetch();
		},
		addOne: function(add,b,c){
			console.log(1,add,b,c)
			var view = new addressView({model: add});
			this.$("#addressList").append(view.render().el);
		},
		sortFun: function(){
			if(addresses.length > 0){
				this.$main.show();
				this.$("#addressList").empty();
				addresses.each(this.addOne,this);
			}
		},
		addAddress: function(){
			var self = this;
			this.$addressWrap.slideUp(500,function(){
				self.$amendAddress.slideDown(500);
			});
		},
		cancelAddress: function(){
			var self = this;
			this.$amendAddress.slideUp(500,function(){
				self.$addressWrap.slideDown(500,function(){
					var type = self.$save.attr('type');
					if(type && type === 'update'){
						self.saveAddress();
					}
					self.$name.val('');
					self.$company.val('');
					self.$phone.val('');
					self.$house.val('');
					self.$email.val('');
				});
			});
		},
		getValList: function(){
			return{
				name: $.trim(this.$name[0].value),
				company: $.trim(this.$company[0].value),
				phone: $.trim(this.$phone[0].value),
				house: $.trim(this.$house[0].value),
				email: $.trim(this.$email[0].value)
			};
		},
		saveAddress: function(){
			var valList = this.getValList();
			valList.showName = valList.name || valList.company || valList.phone || valList.email;
			if(!valList.showName){
				return;
			}
			addresses.create(valList);
			this.cancelAddress();
			this.$save.removeAttr('type');
		},
		searchInput: function(){
			var val = $.trim(this.$searchInput.val());
			addresses.comparator = function(m){
				if(m.get('showName').search(val) !== -1){
					return 1;
				}
			}
			addresses.sort()
		}
	});
	var app = new appView
});