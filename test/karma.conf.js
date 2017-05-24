// Karma configuration
// Generated on 2016-06-16

module.exports = function(config) {
    'use strict';

    config.set({
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // base path, that will be used to resolve files and exclude
        basePath: '../',

        // testing framework to use (jasmine/mocha/qunit/...)
        // as well as any additional frameworks (requirejs/chai/sinon/...)
        frameworks: [
            'jasmine'
        ],

        // list of files / patterns to load in the browser
        files: [
            // bower:js
            'bower_components/jquery/dist/jquery.js',
            'bower_components/es6-promise/es6-promise.js',
            'bower_components/js-polyfills/polyfill.js',
            'bower_components/angular/angular.js',
            'bower_components/bootstrap/dist/js/bootstrap.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-cookies/angular-cookies.js',
            'bower_components/angular-messages/angular-messages.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/angular-touch/angular-touch.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/datatables.net/js/jquery.dataTables.js',
            'bower_components/datatables.net-bs/js/dataTables.bootstrap.js',
            'bower_components/datatables.net-autofill/js/dataTables.autoFill.js',
            'bower_components/datatables-autofill-bootstrap/js/autoFill.bootstrap.js',
            'bower_components/datatables.net-buttons/js/dataTables.buttons.js',
            'bower_components/datatables.net-buttons/js/buttons.colVis.js',
            'bower_components/datatables.net-buttons/js/buttons.flash.js',
            'bower_components/datatables.net-buttons/js/buttons.html5.js',
            'bower_components/datatables.net-buttons/js/buttons.print.js',
            'bower_components/datatables.net-buttons-bs/js/buttons.bootstrap.js',
            'bower_components/datatables.net-responsive/js/dataTables.responsive.js',
            'bower_components/datatables.net-responsive-bs/js/responsive.bootstrap.js',
            'bower_components/datatables.net-scroller/js/dataTables.scroller.js',
            'bower_components/moment/moment.js',
            'bower_components/summernote/dist/summernote.js',
            'bower_components/angular-summernote/dist/angular-summernote.js',
            'bower_components/sweetalert2/dist/sweetalert2.js',
            'bower_components/jquery.maskedinput/dist/jquery.maskedinput.js',
            'bower_components/jt.timepicker/jquery.timepicker.js',
            'bower_components/jquery-timepicker-jt/jquery.timepicker.js',
            'bower_components/angular-jquery-timepicker/src/timepickerdirective.js',
            'bower_components/angular-ui-select/dist/select.js',
            'bower_components/angular-local-storage/dist/angular-local-storage.js',
            'bower_components/firebase/firebase.js',
            'bower_components/angularfire/dist/angularfire.js',
            'bower_components/mockfirebase/browser/mockfirebase.js',
            'bower_components/ngmap/build/scripts/ng-map.js',
            'bower_components/lodash/lodash.js',
            'bower_components/pickadate/lib/picker.js',
            'bower_components/pickadate/lib/picker.date.js',
            'bower_components/pickadate/lib/picker.time.js',
            'bower_components/ng-pickadate/ng-pickadate.js',
            'bower_components/bootstrap-ui-datetime-picker/dist/datetime-picker.js',
            'bower_components/pdfmake/build/pdfmake.js',
            'bower_components/pdfmake/build/vfs_fonts.js',
            'bower_components/yadcf/jquery.dataTables.yadcf.js',
            'bower_components/chosen/chosen.jquery.js',
            'bower_components/flow.js/dist/flow.js',
            'bower_components/ng-flow/dist/ng-flow.js',
            'bower_components/angular-file-upload/dist/angular-file-upload.min.js',
            'bower_components/format-as-currency/dist/format-as-currency.js',
            'bower_components/angular-xeditable/dist/js/xeditable.js',
            'bower_components/chart.js/dist/Chart.js',
            'bower_components/angular-chart.js/dist/angular-chart.js',
            'bower_components/signature_pad/signature_pad.js',
            'bower_components/angular-ui-utils/ui-utils.js',
            'bower_components/angular-ui-map/ui-map.js',
            'bower_components/angular-mocks/angular-mocks.js',
            // endbower
            'app/scripts/**/*.js',
            'test/mock/**/*.js',
            'test/spec/**/*.js'
        ],

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: [
            'PhantomJS'
        ],

        // Which plugins to enable
        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine'
        ],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // Uncomment the following lines if you are using grunt's server to run the tests
        // proxies: {
        //   '/': 'http://localhost:9000/'
        // },
        // URL root prevent conflicts with the site root
        // urlRoot: '_karma_'
    });
};