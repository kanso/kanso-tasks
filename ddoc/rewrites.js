module.exports = [
    {from: '/', to: 'index.html'},
    {from: '/api', to: '../..'},
    {from: '/api/*', to: '../../*'},
    {from: '/modules.js', to: 'modules.js'},
    {from: '/kanso-topbar/*', to: 'kanso-topbar/*'},
    {from: '/css/*', to: 'css/*'},
    {from: '/vendor/*', to: 'vendor/*'},
    {from: '/bootstrap/*', to: 'bootstrap/*'}
];
