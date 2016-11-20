/*jslint browser: true, devel: true, bitwise: true, eqeq: true, plusplus: true, vars: true, indent: 4*/
/*global angular, $, console, swal*/

/**
 * @ngdoc function
 * @name ohanaApp.controller:DirectoryCtrl
 * @description
 * # DirectoryCtrl
 * Controller of management console - directory
 */
angular.module('ohanaApp')
	.controller('DirectoryCtrl', function ($q, commonServices, $scope, $uibModal, Api, dataGridUtil, selectValues) {
		'use strict';

		$scope.buildTable = function (results) {
			var i;
			var packet;
			var dataSet = dataGridUtil.buildMembersTableData(results);
			$scope.currId = ""; // holds value of the current row's member Id for CRUD ops
			$scope.checkedBoxes = [];

			console.log(dataSet);

			angular.element(document).ready(function () {
				//toggle `popup` / `inline` mode
				$.fn.editable.defaults.mode = 'popup';
				$.fn.editable.defaults.ajaxOptions = {
					type: 'PUT'
				};

				//if exists, destroy instance of table
				if ($.fn.DataTable.isDataTable($('#membersTable'))) {
					$scope.membersTable.destroy();
				}

				$scope.membersTable = $('#membersTable').DataTable({
					// ajax: 'testData/members.json',
					data: dataSet,
					columns: [
						{},
						{
							title: "KEY",
							data: "key"
						},
						{
							title: "First Name",
							data: "first"
						},
						{
							title: "Last Name",
							data: "last"
						},
						{
							title: "DOB",
							data: "dob"
						},
						{
							title: "Email",
							data: "email",
							orderable: false
						},
						{
							title: "Mobile #",
							data: "phone",
							orderable: false
						},
						{
							title: "Role",
							data: "role"
						},
						{
							title: "Region",
							data: "region"
						},
						{
							title: "Chapter",
							data: "chapter"
						},
						{
							title: "Mil. Affil.",
							data: "branch",
							orderable: false
						},
						{
							title: "Notes",
							data: "notes",
							orderable: false
						}
					],
					'columnDefs': [
						{
							targets: 1,
							visible: false
						}, {
							targets: 0,
							searchable: false,
							orderable: false,
							className: 'dt-body-center',
							render: function () {
								return '<input type="checkbox" id="membersTable-select">';
							}
						}, {
							targets: 3,
							width: '50px'
						}, {
							targets: 5,
							width: '90px'
						}
					],
					'order': [[3, 'asc']],
					headerCallback: function (thead) {
						$(thead).find('th').eq(0).html('<input type="checkbox" id="membersTable-select-all">');
					},
					rowCallback: function (row, data, index) {
						$(row).find('input[type="checkbox"]').eq(0).attr('value', data.key)
						$(row).children().eq(1).addClass('tdFname');
						$(row).children().eq(2).addClass('tdLname');
						$(row).children().eq(3).addClass('tdDob');
						$(row).children().eq(4).addClass('tdEmail'); // email checking disabled
						$(row).children().eq(5).addClass('tdTelly'); // phone # checking disabled
						$(row).children().eq(6).addClass('tdSelectRole');
						$(row).children().eq(7).addClass('tdSelectRegion');
						$(row).children().eq(8).addClass('tdSelectChapter');
						$(row).children().eq(9).addClass('tdMil');
						$(row).children().eq(10).addClass('tdNotes');
						for (i = 1; i < 10; i++) {
							$(row).children().eq(i).wrapInner('<a class="editable editable-click" style="border: none;"></a>');
						}
						return row;
					},
					drawCallback: function (settings) {
						// set currentId to user being edited
						$('#membersTable').on('click', 'tr', function () {
							$scope.currId = $(this).find('input[type="checkbox"]').val();
							console.log($scope.currId);

							if ($(this).find('input[type="checkbox"]').is(':checked')) {
								$scope.checkedBoxes.push($scope.currId);
							}else{
								for (var i = 0; i < $scope.checkedBoxes.length; i++) {
									if ($scope.checkedBoxes[i] === $scope.currId) {
										$scope.checkedBoxes.splice(i, 1);
									}
								}
							}

							console.log($scope.checkedBoxes);
						});
						// editable field definitions and CRUD ops
						$('#membersTable .tdFname a').editable({
							type: "text",
							name: "first_name",
							placement: "bottom",
							emptytext: "null",
							url: function (params) {
								var packet = {
									member_id: $scope.currId,
									first_name: params.value
								};
								Api.chapterCreateMember
								Api.member.update(packet,
									function (successMsg) {
										console.log('heyo');
									},
									function (errorMsg) {
										console.log('error');
									});
							}
						});
						$('#membersTable .tdLname a').editable({
							type: "text",
							name: "last_name",
							placement: "bottom",
							emptytext: "null",
							url: function (params) {
								var packet = {
									member_id: $scope.currId,
									last_name: params.value
								};
								Api.member.update(packet,
									function (successMsg) {
										console.log('heyo');
									},
									function (errorMsg) {
										console.log('error');
									});
							}
						});
						$('#membersTable .tdDob a').editable({
							type: "combodate",
							name: "DOB",
							placement: "bottom",
							emptytext: "null",
							format: 'YYYY-MM-DD',
							viewformat: 'MM/DD/YYYY',
							template: 'MMM / DD / YYYY',
							combodate: {
								template: 'MMM / DD / YYYY',
								minYear: 1900,
								maxYear: 2020
							},
							url: function (params) {
								var packet = {
									member_id: $scope.currId,
									DOB: params.value
								};
								Api.member.update(packet,
									function (successMsg) {
										console.log('heyo');
									},
									function (errorMsg) {
										console.log('error');
									});
							}
						});
						$('#membersTable .tdEmail a').editable({
							type: "email",
							name: "email",
							placement: "bottom",
							emptytext: "null",
							url: function (params) {
								packet = {
									member_id: $scope.currId,
									email: params.value
								};
								Api.member.update(packet,
									function (successMsg) {
										console.log('heyo');
									},
									function (errorMsg) {
										console.log('error');
									});
							}
							// TODO email throws error Uncaught InvalidStateError: Failed to
							//execute 'setSelectionRange' on 'HTMLInputElement': The input
							// element's type ('email') does not support selection.
							// ONLY IN CHROME. BUG FIX https://bugs.chromium.org/p/chromium/issues/detail?id=346270
						});
						$('#membersTable .tdTelly a').editable({
							type: "text",
							name: "mobile_number",
							placement: "bottom",
							emptytext: "null",
							url: function (params) {
								packet = {
									member_id: $scope.currId,
									mobile_number: params.value
								};
								Api.member.update(packet,
									function (successMsg) {
										console.log('heyo');
									},
									function (errorMsg) {
										console.log('error');
									});
							}
							// TODO fix pattern masking for phone #s
							// pattern: "\d{3}\-\d{3}\-\d{4}"
						});
						$('#membersTable .tdSelectRole a').editable({
							type: "select",
							name: "role",
							placement: "bottom",
							emptytext: "null",
							showbuttons: false,
							url: function (params) {
								var packet = {
									member_id: $scope.currId,
									role: params.value
								};
								Api.member.update(packet,
									function (successMsg) {
										console.log('heyo');
									},
									function (errorMsg) {
										console.log('error');
									});
							},
							source: [
								{
									value: 0,
									text: 'admin'
								},
								{
									value: 1,
									text: 'region_manager'
								},
								{
									value: 2,
									text: 'chapter_manager'
								},
								{
									value: 3,
									text: 'event_manager'
								},
								{
									value: 4,
									text: 'member'
								},
								{
									value: 5,
									text: 'volunteer'
								}
							]
						});
						$('#membersTable .tdSelectRegion a').editable({
							type: "select",
							name: "region",
							placement: "bottom",
							emptytext: "null",
							showbuttons: false,
							url: function (params) {
								var packet = {
									member_id: $scope.currId,
									region: params.value
								};
								Api.member.update(packet,
									function (successMsg) {
										console.log('heyo');
									},
									function (errorMsg) {
										console.log('error');
									});
							},
							source: [
								{
									value: 'northeast',
									text: 'Northeast'
								},
								{
									value: 'midatlantic',
									text: 'Mid-Atlantic'
								},
								{
									value: 'midwest',
									text: 'Midwest'
								},
								{
									value: 'southeast',
									text: 'Southeast'
								},
								{
									value: 'southwest',
									text: 'Southwest'
								},
								{
									value: 'west',
									text: 'West'
								}
							]
						});
						$('#membersTable .tdSelectChapter a').editable({
							type: "select",
							name: "chapter",
							placement: "bottom",
							emptytext: "null",
							showbuttons: false,
							url: function (params) {
								var packet = {
									member_id: $scope.currId,
									chapter_id: params.value
								};
								Api.member.update(packet,
									function (successMsg) {
										console.log('heyo');
									},
									function (errorMsg) {
										console.log('error');
									});
							},
							source: selectValues.editChapters
						});
						$('#membersTable .tdMil a').editable({
							type: "text",
							name: "military_affiliation",
							placement: "bottom",
							emptytext: "null",
							url: function (params) {
								var packet = {
									member_id: $scope.currId,
									military_affiliation: params.value
								};
								Api.member.update(packet,
									function (successMsg) {
										console.log('heyo');
									},
									function (errorMsg) {
										console.log('error');
									});
							}
						});
						$('#membersTable .tdNotes a').editable({
							type: "textarea",
							name: "notes",
							placement: "bottom",
							emptytext: "null",
							url: function (params) {
								var packet = {
									member_id: $scope.currId,
									notes: params.value
								};
								Api.member.update(packet,
									function (successMsg) {
										console.log('heyo');
									},
									function (errorMsg) {
										console.log('error');
									});
							}
						});
					}
				}); //.columns.adjust().draw();

				// Handle click on "Select all" control
				$('#membersTable-select-all').on('click', function () {
					// Get all rows with search applied
					var rows = $scope.membersTable.rows({
						'search': 'applied'
					}).nodes();
					// Check/uncheck checkboxes for all rows in the table
					$('input[type="checkbox"]', rows).prop('checked', this.checked);
				});

				// Handle click on checkbox to set state of "Select all" control
				$('#membersTable tbody').on('change', 'input[type="checkbox"]', function () {
					// If checkbox is not checked
					if (!this.checked) {
						var el = $('#membersTable-select-all').get(0);
						// If "Select all" control is checked and has 'indeterminate' property
						if (el && el.checked && ('indeterminate' in el)) {
							// Set visual state of "Select all" control
							// as 'indeterminate'
							el.indeterminate = true;
						}
					}
				});

			}); // end document ready
		}; // end $scope.buildTable

		$scope.update = function () {
			var newDataSet = commonServices.getData('/userData/');
			var newRoleData = commonServices.getData('/userRoles/');
			$q.all([newDataSet, newRoleData]).then(function(userData) {
				var users = [];
				var roles = [];
				var i = 0;

				_.each(userData[1], function(value) {
					roles.push(value.role);
				});

				_.each(userData[0], function(value, key) {
					value.key = key;
					value.role = roles[i];
					users.push(value);
					i++;
				});

				$scope.buildTable(users);
			});
		}; // end $scope.update

		$scope.add = function () {
			var modalInstance = $uibModal.open({
				templateUrl: '/parts/newUserDirectoryForm.html',
				controller: 'NewUserDirectoryFormCtrl'
			});
//			if (!modalInstance) {
//				$scope.update();
//			}
//			$scope.update();
		}; // end $scope.add

		$scope.remove = function () {
					
			console.log($scope.checkedBoxes.length);
			console.log($scope.checkedBoxes);

			if ($scope.checkedBoxes.length === 0) {
				swal('', 'No records selected!', 'warning');
			} else {
				swal({
					title: 'Are you sure?',
					text: "Get ready to kiss it goodbye!",
					type: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Yes, delete it!'
				}).then(function () {
					for (k = 0; k < $scope.checkedBoxes; k++) {
						// var d = Api.member.get({id: checkedRows[i].id}, function() {
						//   d.$delete(function() {
						//	 console.log('deleting user id ' + checkedRows[i].id);
						//   });
						// });
						// console.log(Api.member.$delete(checkedRows[i].id.$delete());
						// console.log(Api.member.remove({
						// 	member_id: checkedRows[k].id
						// }));
						console.log($scope.checkedBoxes[k]);
					}
					swal('Deleted!', 'Your file has been deleted.', 'success');

					$('#membersTable-select-all').prop('checked', false);
					$('input[type="checkbox"]', rows).prop('checked', false);
				});
			} // end else

		}; // end $scope.remove

	});
