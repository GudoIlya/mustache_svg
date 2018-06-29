var myCanvas = (function(){

	var data = [];
	/* Svg dimensions */
	var svgHeight = "900";
	var svgWidth  = "500";

	var _numberOfHorizontalLines = 5;






	/**
	 * @var min - минимальное знаение данных
	 * @var max - максимальное значение данных
	 * @return - g элемент с вертикальными элементами
	 */ 
	function buildVerticalAxis(min, max, _numberOfHorizontalLines) {
		var step = round(max/_numberOfHorizontalLines);
		
	}





	return {
		/**
		* @var divId - string without sharp
		* @var inputData - array of arrays?
		* @return html - string
		*/
		initSvg : function(divId, inputData) {

			var div = document.getElementById(divId);
			var min = inputData.min();
			var max = inputData.max();
			
			var leftAxis = buildVerticalAxis(min, max, _numberOfHorizontalLines);

		}
	}
}());