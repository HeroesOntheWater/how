'use strict';

/**
 * @ngdoc function
 * @name mainAppApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mainAppApp
 */
angular.module('mainAppApp')
  .controller('NewExpenseCtrl',   function ($scope) {
   
  var user = this;
   

      
 	$scope.createnewexpense = function()
 	{
 	    //alert(this.exp.chaptername);
    $scope.exp.chaptername = "MARYLAND CHAPTER";
 		var Line = [];
    var ImageFile = [];
    var BillId = [];
 		var jsonString='';
 		var obj = {};  //new Object();
 		var i = 0;
   
    var input = document.getElementById('files');

    var chaptername = "MD";
    var currentdate = new Date(); 
    var UniqueBillId = chaptername  + "_"
                + (currentdate.getMonth()+1)  + "_" 
                + currentdate.getDate() + "_"
                + currentdate.getFullYear() + "_"  
                + currentdate.getHours() + "_"  
                + currentdate.getMinutes() + "_" 
                + currentdate.getSeconds() + "_" 
                + Math.floor((Math.random() * 1000) + 1) ;
    var submitdate = (currentdate.getMonth() + 1) + '/' + currentdate.getDate() + '/' +  currentdate.getFullYear();
                 
      var jsonString= ' { "BillId" : "'   + UniqueBillId+ '" , '
          + '"Chapter" : "' + this.exp.chaptername + '" , '
          + ' "eventdate"' + ': "' + this.exp.eventdate + '" , '
          + ' "SubmitDate"' + ': "' + submitdate + '" , '
          + '"Description"' + ': "' + this.exp.Description + '" , '
          + '"PaymentStatus" : "unpaid" , '
          + '"Amount"' + ': "' + ((this.exp.miles * .25) + ( this.exp.trailermiles * .4) + this.exp.Amount3 + ( this.exp.Amount4) ) + '" , '
          + '"Line" : [ ' 
          + ' { "ID" : "1", "Description": "Mileage Rate - Travel @.25/mile", '
          + '"Quantity" : "' +  this.exp.miles   + '"  , ' 
          + '"Amount" : "' + (this.exp.miles * .25) + '" }, ' 
          + '{"ID" : "2", "Description" : "Trailer Mileage Rate @.40/mile", '
          + '"Quantity" : "' +  this.exp.miles   + '"  , ' 
          + '"Amount" : "' + ( this.exp.trailermiles * .4) + '" }, ' 
          + '{"ID" : "3", "Description": "'+  this.exp.Description3 + '" , '
          + '"Quantity" : "1" , '  + '"Amount" : "' + ( this.exp.Amount3) + '" }, ' 
          + '{"ID" : "4", "Description": "'+  this.exp.Description4 + '" , '
          + '"Quantity" : "1" , ' + '"Amount" : "' + ( this.exp.Amount4) + '" } ' 
          + '] ';
 
        var imageString;
        var imagefilename; 
        //alert(jsonString);

         if (input.files.length > 0)
          {
            jsonString = jsonString + ', ' + '"ImageURL" :  [  ';
            for (var x = 0; x < input.files.length; x++) {

               if (x > 0)
              {
                jsonString = jsonString + ' , '; 
              }
         
            imagefilename = 'images/' + UniqueBillId + "_"   + input.files[x].name;
            imageString= '{ "ID" : "' + (x+1) + '", "ImageUrlLocation" : "", "FileName" : "' +  imagefilename + '" }';
            jsonString = jsonString + imageString; 
              
            }

             
             jsonString = jsonString + ' ] }'; 
              
          }
        else
        {
          jsonString = jsonString + ' } '; 
        }
         
 // alert(jsonString);
      var datalocation = 'expense/' ;  
      
       
  
    	firebase.database().ref(datalocation).push(JSON.parse(jsonString))
      .then(function(jsonString) {
      	  
        console.log('success : data pushed');  
       
      })
      .catch(function(error) {
        var errorCode = error.code;
          var errorMessage = error.message;
          console.log('ERROR: ' + error.code + ': ' + error.message);
      }); 

      if (input.files.length > 0)
      {
        
        LoadImageData(UniqueBillId, datalocation);
         
      }
      alert("Success:  New Expense created for event - " + this.exp.eventdate );
       

 }
  
 	 
   
}); 


function LoadImageData(UniqueBillId, datalocation) { 

    
   var imageobj = {};   
   var inp = document.getElementById('files');
 
  for (var i = 0; i < inp.files.length; ++i) 
  {
    var filename = inp.files.item(i).name;
         
    
    var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];
    var blnValid = false;
    for (var j = 0; j < _validFileExtensions.length; j++) {
        var sCurExtension = _validFileExtensions[j];
     
        if (filename.substr(filename.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
           
            var storage = firebase.storage();

            var file = document.getElementById("files").files[i];            
    
            var storageRef = firebase.storage().ref();         
            var path = storageRef.fullPath 

          var filelocname = 'images/'+ UniqueBillId + '_' +  file.name;
         
          storageRef.child(filelocname).put(file).then(function(snapshot) {                                
                                  console.log('Uploaded a blob or file!');
                         });
                       
        

}
}
}
}

