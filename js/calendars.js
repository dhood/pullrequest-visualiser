$(function() {
  $( "#sincedatepicker" ).datepicker({
    defaultDate: "+1w",
    showButtonPanel: true,
    changeMonth: true,
    changeYear: true,
    onClose: function( selectedDate ) {
      $( "#uptodatepicker" ).datepicker( "option", "minDate", selectedDate );
      $( "#uptodatepicker" ).datepicker( "option", "defaultDate", selectedDate );
    }
  });
  $( "#uptodatepicker" ).datepicker({
    defaultDate: "+1w",
    showButtonPanel: true,
    changeMonth: true,
    changeYear: true,
    onClose: function( selectedDate ) {
      $( "#sincedatepicker" ).datepicker( "option", "maxDate", selectedDate );
      $( "#sincedatepicker" ).datepicker( "option", "defaultDate", selectedDate );
    }
  });
});
/*
$.datepicker._gotoToday = function(id) { 
    $(id).datepicker('setDate', new Date()); 
};
*/