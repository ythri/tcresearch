$(function () {
	

	var app = {};
	var $steps = $('#steps');

	app.init = function () {
		app.watchForStepsChanges();
	}

	app.watchForStepsChanges = function () {
		$('#increment').click(function (e) {
			e.preventDefault();
			
			var val = $steps.val();
			val = +val + 1;
			$steps.val(val);
		});

		$('#decrement').click(function (e) {
			e.preventDefault();
			
			var val = $steps.val();
			val = (val > 1) ? +val - 1 : 1;
			$steps.val(val);
		});
	}


	app.init();


});
