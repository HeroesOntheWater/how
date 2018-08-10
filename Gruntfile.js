// Generated on 2016-10-03 using generator-angular 0.15.1
'use strict';

//added jsbeautify
//removed jshint and jscs from the watch=>js files steps
//added debounce to the watch



//notes from nov 20th thad
//moved grunt file back to original, borrowed from common_lib branch or basically whatever yeoman/angular first produces
//added grunt injector to inject css and js files into the usemin pipeline 
//.bowerrc file's directory was moved back to just bower_components instead of app/bower_components
//updated ngtemplates's module to match the angular app name
//added a new copy for copy assets who's references in code never were updated by standard build

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/**/*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

//{,*/} means only children nodes of a tree, it DOES NOT mean decendants
//2/21/2017 all looking like parts/{,*/}.css -> parts/**/*.css


//3/4/2017
//updated injector to have a destination point and updated assets to 
//pull in the files for waiver signing

// August 19, 2017
// removed jsbeautifier from livereload watch. only beautifies precommit with npm run ready
module.exports = function(grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Automatically load required Grunt tasks
    require('jit-grunt')(grunt, {
        useminPrepare: 'grunt-usemin',
        ngtemplates: 'grunt-angular-templates',
        cdnify: 'grunt-google-cdn'
    });

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: 'dist',
        base_href: '/HOW/',
        debounceDelay: '900'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            pdf: {
                files: ['<%= yeoman.app %>/assets/**/*.pdf']
            },
            js: {
                files: ['<%= yeoman.app %>/**/*.js'],
                //tasks: ['newer:jshint:all', 'newer:jscs:all', 'jsbeautifier'],
                options: {
                    livereload: '<%= connect.options.livereload %>',
                    debounceDelay: '<%= yeoman.debounceDelay %>'
                }
            },
            jsTest: {
                files: ['test/spec/**/*.js'],
                tasks: ['newer:jshint:test', 'newer:jscs:test', 'karma']
            },
            styles: {
                files: ['<%= yeoman.app %>/styles/**/*.css'],
                tasks: ['newer:copy:styles', 'postcss'],
                options: {
                    debounceDelay: '<%= yeoman.debounceDelay %>'
                }
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>',
                    debounceDelay: '<%= yeoman.debounceDelay %>'
                },
                files: [
                    '<%= yeoman.app %>/**/*.html',
                    '.tmp/styles/**/*.css',
                    //this picks up the pdf for grunt serve. although... it does need to exists in .tmp first
                    //syke that didn't work 
                    '<%= yeoman.app %>/assets/**/*.pdf',
                    '<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
                ],
                // tasks: ['jsbeautifier']
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            //didn't work 
                            // connect().use(
                            //     '/app/assets/Media_Waiver_Form.pdf',
                            //     connect.static('./app/assets/Media_Waiver_Form.pdf')
                            // ),
                            connect.static('/app/assets/Media_Waiver_Form.pdf'),
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect().use(
                                '/app/styles',
                                connect.static('./app/styles')
                            ),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect.static('test'),
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= yeoman.dist %>'
                }
            }
        },

        // Make sure there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= yeoman.app %>/scripts/**/*.js'
                ]
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/**/*.js']
            }
        },

        // Make sure code styles are up to par
        jscs: {
            options: {
                config: '.jscsrc',
                verbose: true
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= yeoman.app %>/scripts/**/*.js'
                ]
            },
            test: {
                src: ['test/spec/**/*.js']
            }
        },

        // Empties the .tmp temporary folder to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/**/*',
                        '!<%= yeoman.dist %>/.git**/*'
                    ]
                }]
            },
            server: '.tmp'
        },
        injector: {
            options: {
                template: 'app/index.html',
                destFile: 'app/index.html',
                transform: function(filepath, index, length) {
                    if (filepath.includes('/app') && filepath.indexOf('/app') == 0) {
                        console.log(filepath);
                        filepath = '<script src="' + filepath.substring(5) + '"></script>';
                        return filepath;
                    }
                }
            },
            local_dependencies: {
                files: {
                    'index.html': ['<%= yeoman.app %>/extensions/bootstrap-editable/js/bootstrap-editable.js',
                        'styles/**/*.css',
                        // '<%= yeoman.app %>/extensions/bootstrap-editable/css/bootstrap-editable.css',
                        // '<%= yeoman.app %>/extensions/hamburgers.min.css',
                        '<%= yeoman.app %>/assets/**.js',
                        '<%= yeoman.app %>/modals/controllers/**.js'
                    ],
                }
            }
        },

        // Add vendor prefixed styles
        postcss: {
            options: {
                processors: [
                    require('autoprefixer-core')({
                        browsers: ['last 1 version']
                    })
                ]
            },
            server: {
                options: {
                    map: true
                },
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '**/*.css',
                    dest: '.tmp/styles/'
                }, {
                    expand: true,
                    cwd: '.tmp/extensions/',
                    src: '**/*.css',
                    dest: '.tmp/extensions/'
                }, {
                    expand: true,
                    cwd: '.tmp/assets/',
                    src: '**/*.css',
                    dest: '.tmp/assets/'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '**/*.css',
                    dest: '.tmp/styles/'
                }, {
                    expand: true,
                    cwd: '.tmp/extensions/',
                    src: '**/*.css',
                    dest: '.tmp/extensions/'
                }, {
                    expand: true,
                    cwd: '.tmp/assets/',
                    src: '**/*.css',
                    dest: '.tmp/assets/'
                }]
            }
        },

        // Automatically inject Bower components into the app
        wiredep: {
            app: {
                src: ['<%= yeoman.app %>/index.html'],
                ignorePath: /\.\.\//
            },
            test: {
                devDependencies: true,
                src: '<%= karma.unit.configFile %>',
                ignorePath: /\.\.\//,
                fileTypes: {
                    js: {
                        block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
                        detect: {
                            js: /'(.*\.js)'/gi
                        },
                        replace: {
                            js: '\'{{filePath}}\','
                        }
                    }
                }
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= yeoman.dist %>/scripts/**/*.js',
                    '<%= yeoman.dist %>/modals/controllers/**/*.js',
                    '<%= yeoman.dist %>/styles/**/*.css',
                    '<%= yeoman.dist %>/extensions/**/*.css',
                    '<%= yeoman.dist %>/assets/**/*.css',
                    '<%= yeoman.dist %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= yeoman.dist %>/styles/fonts/*'
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: ['<%= yeoman.dist %>/modals/views/**/*.html',
                '<%= yeoman.dist %>/views/**/*.html',
                '<%= yeoman.dist %>/*.html'
            ],
            css: ['<%= yeoman.dist %>/styles/**/*.css',
                '<%= yeoman.dist %>/extensions/**/*.css',
                '<%= yeoman.dist %>/assets/**/*.css'
            ],
            js: [
                '<%= yeoman.dist %>/scripts/**/*.js',
                '<%= yeoman.dist %>/modals/controllers/**/*.js'
            ],
            options: {
                assetsDirs: [
                    '<%= yeoman.dist %>',
                    '<%= yeoman.dist %>/images',
                    '<%= yeoman.dist %>/styles',
                    '<%= yeoman.dist %>/extensions',
                    '<%= yeoman.dist %>/assets'
                ],
                patterns: {
                    js: [
                        [/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']
                    ]
                }
            }
        },

        // The following *-min tasks will produce minified files in the dist folder
        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        // cssmin: {
        //   dist: {
        //     files: {
        //       '<%= yeoman.dist %>/styles/main.css': [
        //         '.tmp/styles/**/*.css'
        //       ]
        //     }
        //   }
        // },
        // uglify: {
        //   dist: {
        //     files: {
        //       '<%= yeoman.dist %>/scripts/scripts.js': [
        //         '<%= yeoman.dist %>/scripts/scripts.js'
        //       ]
        //     }
        //   }
        // },
        // concat: {
        //   dist: {}
        // },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '**/*.{png,jpg,jpeg,gif}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '**/*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: ['*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },

        ngtemplates: {
            dist: {
                options: {
                    module: 'ohanaApp',
                    htmlmin: '<%= htmlmin.dist.options %>',
                    usemin: 'scripts/scripts.js'
                },
                cwd: '<%= yeoman.app %>',
                src: ['views/**/*.html', 'modals/views/**/*.html'],
                dest: '.tmp/templateCache.js'
            }
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        // Replace Google CDN references
        cdnify: {
            dist: {
                html: ['<%= yeoman.dist %>/*.html']
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '*.html',
                        'images/**/*.{webp}'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: ['generated/*']
                }]
            },
            //patch by thad
            dist_remainder: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        'extensions/bootstrap-editable/js/bootstrap-editable.js',
                        'styles/**/*.css',
                        'assets/**/*.*',
                        'assets/**/*',
                        'modals/views/**/*.html',
                        'extensions/bootstrap-editable/css/bootstrap-editable.css',
                        'extensions/hamburgers.min.css'
                        // 'parts/**/*.*'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    dest: '<%= yeoman.dist %>/styles',
                    src: [
                        'bower_components/components-font-awesome/**/*.*',
                        'bower_components/bootstrap/dist/**/*.*'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    dest: '<%= yeoman.dist %>',
                    src: '.surgeignore'
                }]
            },
            styles: {
                // expand: true,
                // cwd: '<%= yeoman.app %>/styles',
                // dest: '.tmp/styles/',
                // src: '**/*.css'
                //for waiver support on events page - the actual fix, syke didn't work 
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/styles',
                    dest: '.tmp/styles/',
                    src: '**/*.css'
                }, {
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '.tmp/',
                    src: 'assets/**/*.pdf'
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '.tmp/',
                    src: [
                        'extensions/**/*.css',
                        'assets/**/*.css'
                    ]
                }]
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'copy:styles'
            ],
            test: [
                'copy:styles'
            ],
            dist: [
                'copy:styles',
                'imagemin',
                'svgmin'
            ]
        },

        // Test settings
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        },
        replace: {
            dist: {
                options: {
                    patterns: [{
                        match: /<!-- base_href -->/g,
                        replacement: '<base href="<%= yeoman.base_href %>">'
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['<%= yeoman.dist %>/index.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        "jsbeautifier": {
            files: ["Gruntfile.js", "./**.json",
                // "./**.js", 
                "bower.json",
                // "app/**/*.js", 
                "app/**/*.html", "app/**/*.css", "app/**/*.json", "!app/bower_components/**/*.*"
            ],
            options: {
                //config: "path/to/configFile",
                html: {
                    braceStyle: "collapse",
                    indentChar: " ",
                    indentScripts: "keep",
                    indentSize: 2,
                    maxPreserveNewlines: 10,
                    preserveNewlines: true,
                    unformatted: ["a", "sub", "sup", "b", "i", "u"],
                    wrapLineLength: 0
                },
                css: {
                    indentChar: " ",
                    indentSize: 2
                },
                // js: {
                //   braceStyle: "collapse",
                //   breakChainedMethods: false,
                //   e4x: false,
                //   evalCode: false,
                //   indentChar: " ",
                //   indentLevel: 0,
                //   indentSize: 2,
                //   indentWithTabs: false,
                //   jslintHappy: false,
                //   keepArrayIndentation: false,
                //   keepFunctionIndentation: false,
                //   maxPreserveNewlines: 10,
                //   preserveNewlines: true,
                //   spaceBeforeConditional: true,
                //   spaceInParen: false,
                //   unescapeStrings: false,
                //   wrapLineLength: 0,
                //   endWithNewline: true
                // }
            }
        }
    });


    grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'injector',
            'jsbeautifier',
            'clean:server',
            'wiredep',
            'concurrent:server',
            'postcss:server',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function(target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'wiredep',
        'concurrent:test',
        'postcss',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('build', [
        'injector',
        'clean:dist',
        'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'postcss',
        'ngtemplates',
        'concat',
        'ngAnnotate',
        'copy:dist',
        'cdnify',
        'cssmin',
        'uglify',
        'filerev',
        'usemin',
        'htmlmin',
        'copy:dist_remainder'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'newer:jscs',
        'test',
        'build'
    ]);
};
