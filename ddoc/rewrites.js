module.exports = [
    {from: '/', to: 'index.html'},
    {from: '/api', to: '../..'},
    {from: '/api/*', to: '../../*'},
    {from: '/modules.js', to: 'modules.js'},
    {from: '/css/*', to: 'css/*'},
    {from: '/img/*', to: 'img/*'},
    {from: '/vendor/*', to: 'vendor/*'},
    {from: '/bootstrap/*', to: 'bootstrap/*'}
];
