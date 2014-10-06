module.exports = function(grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*\n<%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n<%= pkg.description %>\nLovingly coded by <%= pkg.author.name %>  - <%= pkg.author.url %> \n*/\n',
        uglify: {
            options: {
                banner: '<%= banner %>',
                mangle: false,
                preserveComments: false
            },
            dist: {
                files: {
                    'public/js/<%= pkg.name %>.js': ['public/js/main.js']
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            uglify: {
                files: ['public/js/main.js', 'public/js/lib/*.js'],
                tasks: ['uglify:dist']
            },
            php: {
                files: '**/*.html',
            }
        },
        modernizr: {
            dist: {
                "devFile" : "remote",
                "outputFile" : "public/js/lib/modernizr.js",
                "files": {
                    "src": ['public/js/bower_components/*']
                }
            }
        },
        copy: {
            bower: {
                files: [{
                    expand: true,
                    flatten: true,
                    dot: true,
                    dest: 'public/css',
                    src: [
                        'public/js/bower_components/bootstrap/less/*'
                    ]
                }]
            }
        },
        rename: {
            bootstrap: {
                src: 'public/css/bootstrap.less',
                dest: 'public/css/styles.less'
            }
        }
    });

    grunt.registerTask('build', [   
        'uglify:dist'
    ]);

    grunt.registerTask('server', [
        'uglify:dist',
        'watch'
    ]);

    grunt.registerTask('init', [
        'uglify:dist',
        'modernizr',
        'copy:bower',
        'rename:bootstrap'
    ]);

    grunt.registerTask('default', 'build');
}
