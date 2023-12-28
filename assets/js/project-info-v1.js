const serviceRoot = 'https://aliconnect.nl/v1';
const socketRoot = 'wss://aliconnect.nl:444';
Web.on('loaded', (event) => Abis.config({serviceRoot,socketRoot}).init({
  configfiles: [
    'https://aliconnect.nl/elmabv/api/elma',
    'https://aliconnect.nl/elmabv/api/elma-site',
    // 'https://aliconnect.nl/elmabv/api/elma-site-local',
  ],
  nav: {
    search: true,
  },
}).then(async (abis) => {
  const data1 = await loadExcelSheet('20235053-project-info.xlsx');
  console.log('JA',data1);
  return;
  // $(document.documentElement).class('app',1);
  // [
  //   '.icn-navigation',
  //   '.icn-local_language',
  //   '.icn-settings',
  //   '.icn-question',
  //   '.icn-cart',
  //   '.icn-chat_multiple',
  //   '.icn-person',
  // ].forEach(tag => $(tag).remove());

  // $('input').parent('nav>.mw').value(window.localStorage.getItem('username')).on('change', event => window.localStorage.setItem('username', event.target.value.trim()));

  const {searchParams} = new URL(document.location.href);
  const {config,Client,Prompt,Pdf,Treeview,Listview,Statusbar,XLSBook,authClient,abisClient,socketClient,tags,treeview,listview,account,Aliconnect,getAccessToken} = abis;
  const {num} = Format;
  // await Aim.fetch('https://aliconnect.nl/elmabv/api/elma').get().then(config);
  // await Aim.fetch('https://aliconnect.nl/elmabv/api/elma-site').get().then(config);
  const {filenames,definitions,sitetree} = config;
  // console.log(JSON.stringify(definitions.person));
  function menuclick(e){
    e.stopPropagation();
    $('.pagemenu').el.style.display = 'none';
    setTimeout(() => $('.pagemenu').el.style.display = '');
    function par([title,chapter], level) {
      return $('div').class('row').append(
        $('div').class('mw').append(
          $('div').class('').append(
            !chapter.image ? null : $('img').class('sideimage').src(chapter.image),
            !chapter.youtube ? null : $('iframe').class('sideimage').src('https://www.youtube.com/embed/'+chapter.youtube+'?autoplay=0&controls=0&mute=1&autoplay=1&loop=1&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&enablejsapi=1&wmode=opaque').attr('allowfullscreen','').attr('allow','autoplay;fullscreen'),
            !chapter.mp4 ? null : $('video').class('sideimage').attr('controls', '').append(
              $('source').type('video/mp4').src(chapter.mp4),
            ),
            $('h1').append(
              $('a').text(chapter.title || title).on('click', menuclick.bind(chapter)),
            ),
            $('p').html((chapter.description||'').split('\n').join('\n\n').render()),
            level !== 1 ? null : $('p').html((chapter.details||'').split('\n').join('\n\n').render()),
            $('div').class('row').append(
              level && chapter.contacts ? $('div').append(
                $('div').text('Voor meer informatie kunt u contact opnemen met:'),
                $('div').class('row contacts').append(
                  chapter.contacts.map(contact => $('div').class('row').append(
                    $('img').src(contact.img),
                    $('div').append(
                      $('div').text(contact.name),
                      $('div').text(contact.jobTitle).style('font-size:0.8em;'),
                      $('a').href('mailto:'+contact.mailto).text('Stuur mail'),
                      $('a').href('tel:'+contact.tel).text(String(contact.tel).replace(/31/, '+31 (0)')),
                    ),
                  ))
                ),
              ) : null,
            ),
            level && chapter.docs ? $('div').append(
              chapter.docs.map(doc => $('div').append(
                $('a').text(doc.href.split('/').pop().split('.').shift()).href(doc.href).target('doc'),
              ))
            ) : null
          ),
          // $('div').append(
          //   !chapter.image ? null : $('img').src(chapter.image),
          //   !chapter.youtube ? null : $('iframe').src('https://www.youtube.com/embed/'+chapter.youtube+'?autoplay=0&controls=0&mute=1&autoplay=1&loop=1&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&enablejsapi=1&wmode=opaque').attr('allowfullscreen','').attr('allow','autoplay;fullscreen'),
          //   !chapter.mp4 ? null : $('video').attr('controls', '').append(
          //     $('source').type('video/mp4').src(chapter.mp4),
          //   ),
          // ),
        ),
      )
    }
    if (this.properties) {
      $('main.row').clear().append(
        $('div').class('col mw page').append(
          $('form').properties(this, true),
        ),
      );
    } else {
      $('main.row').clear().append(
        $('div').class('col chapters').append(
          par([null,this], 1),
          Object.entries(this.children||{}).map(par),
        ),
      );
    }
  }

  async function companyprofile(search){
    const {companies,contacts,projects} = await Aim.fetch('http://10.10.60.31/api/company/profile').get({search});
    function propertiesElement(item){
      return $('table').append(
        Object.entries(item).filter(entry => entry[1] && !String(entry[1]).match(/^-/)).map(entry => $('tr').append([
          $('th').text(entry[0].displayName()).style('width:30%;'),
          $('td').text(entry[1]).style('width:70%;'),
        ])),
      )
    }
    $('div').append(
      $('link').rel('stylesheet').href('https://aliconnect.nl/sdk-1.0.0/lib/aim/css/print.css'),
      companies.map(company => [
        $('h1').text('Company',company.companyName),
        propertiesElement(company),
        contacts.filter(contact => contact.companyId == company.companyId).map(contact => [
          $('h2').text('Contact',contact.fullName),
          propertiesElement(contact),
        ]),
        projects.filter(project => project.debName.trim() == company.companyName.trim()).map(project => [
          $('h2').text('Project',project.description),
          propertiesElement(project),
        ]),
      ]),
    ).print();
    console.log(30,{companies,contacts,projects});
  }

  function excelDateToJSDate(serial) {
     var utc_days  = Math.floor(serial - 25569);
     var utc_value = utc_days * 86400;
     var date_info = new Date(utc_value * 1000);
     var fractional_day = serial - Math.floor(serial) + 0.0000001;
     var total_seconds = Math.floor(86400 * fractional_day);
     var seconds = total_seconds % 60;
     total_seconds -= seconds;
     var hours = Math.floor(total_seconds / (60 * 60));
     var minutes = Math.floor(total_seconds / 60) % 60;
     return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
  }
  function loaddata(data) {
    // console.log(123, data);
    Object.keys(data).filter(schemaName => definitions[schemaName]).forEach(schemaName => {
      Object.assign(definitions[schemaName].prototype = definitions[schemaName].prototype || {},{select});
      data[schemaName].forEach((item,id) => new Item({schemaName,id:[schemaName,item.id||id].join('_')},item));
    })
  }
  function loadExcelSheet(src) {
    return new Promise((succes,fail)=>{
      const data = {};
      fetch(src, {cache: "no-cache"}).then((response) => response.blob()).then(blob => {
        const reader = new FileReader();
        reader.readAsBinaryString(blob);
        reader.onload = (event) => {
          const workbook = XLSX.read(event.target.result, {type:'binary'});
          workbook.SheetNames.forEach(schemaName => {
            const wbsheet = workbook.Sheets[schemaName];
            if (!wbsheet['!ref']) return;
            const [start,end] = wbsheet['!ref'].split(':');
            const [end_colstr] = end.match(/[A-Z]+/);
            const [rowcount] = end.match(/\d+$/);
            const col_index = XLSX.utils.decode_col(end_colstr);
            const colnames = [];
            const rows = [];
            for (var c=0;c<=col_index;c++) {
              var cell = wbsheet[XLSX.utils.encode_cell({c,r:0})];
              if (cell) {
                colnames[c] = String(cell.v);
              }
            }
            for (var r=1;r<rowcount;r++) {
              const row = {};
              for (var c=0;c<=col_index;c++) {
                var cell = wbsheet[XLSX.utils.encode_cell({c,r})];
                if (cell && cell.v) {
                  row[colnames[c]] = cell.v;
                }
              }
              rows.push(row);
            }
            data[schemaName] = rows;
          })
          succes(data);
        }
      })
    }).catch(console.error);
  }
  function loadExcelData(src) {
    return new Promise((succes,fail)=>{
      // console.log(src);
      const data = {};
      fetch(src, {cache: "no-cache"}).then((response) => response.blob()).then(blob => {
        const reader = new FileReader();
        reader.readAsBinaryString(blob);
        reader.onload = (event) => {
          const workbook = XLSX.read(event.target.result, {type:'binary'});
          workbook.SheetNames.forEach(schemaName => {
            const wbsheet = workbook.Sheets[schemaName];
            if (!wbsheet['!ref']) return;
            // console.log(name,wbsheet['!ref']);
            const [start,end] = wbsheet['!ref'].split(':');
            const [end_colstr] = end.match(/[A-Z]+/);
            const [rowcount] = end.match(/\d+$/);
            const col_index = XLSX.utils.decode_col(end_colstr);
            const colnames = [];
            const rows = [];
            for (var c=0;c<=col_index;c++) {
              var cell = wbsheet[XLSX.utils.encode_cell({c,r:0})];
              if (cell) {
                colnames[c] = String(cell.v);
              }
            }
            for (var r=1;r<rowcount;r++) {
              // const row = {schemaName};
              const row = {};
              for (var c=0;c<=col_index;c++) {
                var cell = wbsheet[XLSX.utils.encode_cell({c,r})];
                if (cell && cell.v) {
                  row[colnames[c]] = cell.v;
                }
                // row[colnames[c]] = cell && cell.v ? cell.v : null;
              }
              rows.push(row);
              // console.log(excelDateToJSDate(row.date));
            }
            data[schemaName] = rows;
            //
            // for (var c=0;c<=col_index;c++) {
            //   var cellstr = XLSX.utils.encode_cell({c:c,r:0});
            //   var cell = wbsheet[cellstr];
            //   if (!cell || !cell.v) {
            //     break;
            //   }
            //   properties[cell.v] = properties[cell.v] || { type: types[cell.t] || 'string' }
            //   // ////console.debug(cellstr, cell);
            // }


            // console.log(name,rowcount,colnames,rows);
          })
          loaddata(data);
          succes(data);
        }
      })
    }).catch(console.error);
  }
  function select() {
    document.querySelectorAll('.pages>div').forEach(el => el.remove());
    $('.pages').clear();
    this.pageElem();
  }

  config({
    definitions: {
      project: {
        prototype: {
          get pageNav() { return [
            $('button').class('icn-print').append($('nav').append(
              $('button').class('icn-document').caption('Offerte').on('click', e => this.docOfferte()),
              $('button').class('icn-document').caption('Plan').on('click', e => this.docPlan()),
              $('button').class('icn-document').caption('Statusrapport').on('click', e => this.docStatus()),
            )),
          ]},
          docOfferte() {
            console.log('Offerte');
            const project = this;
            const taken = Item.task;
            $('div').append(
              $('link').rel('stylesheet').href('https://aliconnect.nl/sdk-1.0.0/lib/aim/css/print.css'),
              $('p').text('OFFERTE'),
              $('h1').text([project.opdrachtgever,project.eindklant,project.name].filter(Boolean).join(' > ')),
              project.image ? $('img').src(project.image).style('max-width:100%;max-height:30mm;') : null,
              $('table').class('grid').style('width:100%;').append(
                $('tbody').append(
                  $('tr').append(
                    $('th').text('Opdrachtgever'),$('td').text(project.opdrachtgever),
                    $('th').text('Projectnummer'),$('td').text(project.nr),
                  ),
                  $('tr').append(
                    $('th').text('Eindklant'),$('td').text(project.eindklant),
                    $('th').text('Projectmanager'),$('td').text(project.pm),
                  ),
                  $('tr').append(
                    $('th').text('Locatie'),$('td').text(project.location),
                    $('th').text('Leadengineer'),$('td').text(project.le),
                  ),
                  $('tr').append(
                    $('th').text('Naam'),$('td').text(project.name),
                  ),
                  $('tr').append(
                    $('th').text('Omschrijving'),$('td').text(project.description),
                  ),
                ),
              ),
              $('table').class('grid').style('width:100%;').append(
                $('thead').append(
                  $('tr').append(
                    $('th').text('Taak'),
                    $('th').html('Calc'),
                  ),
                ),
                $('tbody').append(
                  taken.filter(item => item.projectnr == project.nr).map(item => $('tr').append(
                    $('td').text(item.Taak).style('width:100%;'),
                    $('td').style('text-align:right;').text(num(item.budget,0)),
                  )),
                  $('tr').append(
                    $('th').text('Totaal').style('font-weight:bold;'),
                    $('td').style('text-align:right;').text(num(taken.filter(item => item.projectnr == project.nr).map(item => item.budget).reduce((t,v) => t+v, 0),0)),
                  ),
                ),
              ),

              $('h2').text('Aandachtspunten'),
              $('ol').append(
                Item.issue.filter(item => item.projectnr == project.nr).map(item => $('li').text(item.title)),
              ),
            ).print();
          },
          docPlan() {

          },
          docStatus() {

          },
        },
      },
    },
  })

  Object.keys(config).filter(schemaName => definitions[schemaName]).forEach(schemaName => {
    Object.assign(definitions[schemaName].prototype = definitions[schemaName].prototype || {},{select});
    config[schemaName].forEach((item,id) => new Item({schemaName,id:[schemaName,item.id||id].join('_')},item));
  });

  for (const filename of filenames) {
    await loadExcelData(filename);
  }

  // console.log(Item.person);
  const indienst = Item.person.filter(item => item.status === 'indienst');
  const jobtitles = Item.jobTitle;//.filter(item => indienst.some(person => person.jobTitle === item.jobTitle));
  console.log(jobtitles);
  if (sitetree) {
    sitetree.Organisatie.children.Elma = {
      children: indienst.map(item => item.department).unique().sort().map(department => Object({
        title: department,
        children: indienst.filter(item => item.department === department).map(item => item.jobTitle).unique().sort().map(jobTitle => Object({
          title: jobTitle,
          children: indienst.filter(item => item.department === department && item.jobTitle === jobTitle).map(item => Object({
            title: item.id,
          }))
        })),
      }))
    }
    sitetree.Organisatie.children.JobTitles = {
      children: jobtitles.map(item => item.department).unique().sort().map(department => Object({
        title: department,
        children: jobtitles.filter(item => item.department === department).map(jobTitle => Object({
          title: jobTitle.jobTitle,
          description: jobTitle.department,
        })),
      }))
    }
    $('.pagemenu').append(
      $('ul').append(
        Object.entries(sitetree).map(([title,l1]) => $('li').append(
          $('a').text((l1||{}).title || title).on('click', menuclick.bind(l1)),
          $('ul').append(
            Object.entries((l1||{}).children||[]).map(([title,l2]) => $('li').append(
              $('a').text((l2||{}).title || title).on('click', menuclick.bind(l2)),
              $('ul').append(
                Object.entries((l2||{}).children||[]).map(([title,l3]) => $('li').append(
                  $('a').text((l3||{}).title || title).on('click', menuclick.bind(l3)),
                  $('ul').append(
                    Object.entries((l3||{}).children||[]).map(([title,l4]) => $('li').append(
                      $('a').text((l4||{}).title || title).on('click', menuclick.bind(l4)),
                    ))
                  )
                  // $('a').text(l3.title).on('click', menuclick.bind(l3)),
                ))
              )
            ))
          )
        ))
      )
    )
  }


  loaddata(await Aim.fetch('http://10.10.60.31/api/exact/project').get());
  loaddata(await Aim.fetch('http://10.10.60.31/api/exactdata').get());
  loaddata(await Aim.fetch('http://10.10.60.31/api/exactdata_uren').get());
  loadExcelData('http://10.10.60.31/engineering/Projects/Planning/Planning Systems.xlsx').then(async data => {
    const {project,productionorder} = Item;
    const taken = Item.task2;
    project.forEach(project => {
      project.title = [project.opdrachtgever,project.eindklant,project.name,project.location].filter(Boolean).join(' > ');
      project.budget = 0;
      project.besteed = 0;
      project.tegaan = 0;
      project.resultaat = 0;
    })
    project.sort((a,b) => a.title.localeCompare(b.title));
    const projecten = project.filter(project => ['active'].includes(project.status));
    const {weburen_totaal} = await Aim.fetch('http://10.10.60.31/api/weburen_totaal').body({nrs:taken.map(task => task.ordernr).unique().filter(Boolean).join(',')}).post();
    taken.forEach(task => {
      task.budget = task.budget || 0;
      task.tegaan = task.tegaan || 0;
      task.besteed = task.besteed || 0;
    });
    weburen_totaal.forEach(uren => {
      const task = taken.find(task =>
        task.ordernr == uren.ordernr &&
        task.orderdeel == uren.orderdeel &&
        task.activiteit == uren.activiteit &&
        task.deel == uren.deel
      );
      if (task) {
        Object.assign(task,uren);
      } else {
        uren.nietinplanning = true;
        taken.push(uren);
      }
    });
    taken.forEach(task => {
      task.notes = [];
      task.weken = [];
      task.resultaat = (task.budget || 0) - (task.besteed || 0) - (task.tegaan || 0);
      if (!task.besteed && task.tegaan) {
        task.status = 'nieuw';
      } else if (task.besteed && task.tegaan) {
        task.status = 'actief';
      } else if (task.besteed) {
        task.status = 'gereed';
      }
    })
    taken.filter(task => task.nietinplanning).forEach(task => task.notes.push(`Taak komt niet voor in planning! Geen budget! Uren geboekt ${num(task.besteed,1)}.`));
    taken.filter(task => task.resources && !task.budget && task.tegaan).forEach(task => task.notes.push(`Geen budget ingevoerd! Wel nog ${task.tegaan} uren te besteden door ${task.resources}`));
    taken.filter(task => task.resources && task.tegaan == 0.1).forEach(task => task.notes.push(`Uren te gaan onbekend. Graag uren opgeven voor deze taak voor ${task.resources}`));

    const resources = taken.filter(task => task.resources).map(task => task.resources.split(';')).flat().unique().sort().map(fullname => Object.assign(Item.person.find(person => person.id == fullname) || {},{
      fullname,
      weken:[],
      tasks:[],
    }));
    // console.log(resources);

    projecten.forEach(project => project.notes = []);
    projecten.filter(project => !project.projectmanager).forEach(project => project.notes.push('Projectmanager niet ingevuld, wie is de Projectmanager?'));
    projecten.filter(project => !project.opdrachtgever).forEach(project => project.notes.push('Opdrachtgever niet ingevuld, wie is de Opdrachtgever?'));
    projecten.filter(project => !project.eindklant).forEach(project => project.notes.push('Eindklant niet ingevuld, wie is de Eindklant?'));
    // Maak planning
    function weekindex(date){
      const index = Math.round((date - new Date()) / 7 / 24 / 1000 / 3600);
      return date.getWeekday() == 6 ? index + 1 : index;
    }
    function weekyear(date){
      return (date.getFullYear()-2000) * 100 + date.getWeek();
    }

    const currentWeek = weekyear(new Date());
    const maxuren = 40;
    const planweken = 40;
    const weken = [];
    var date = new Date();
    for (let i=0;i<=planweken;i++) {
      weken.push(date.getWeek());
      date.addDays(7);
      resources.forEach(resource => resource.weken[i] = 0)
      taken.forEach(item => item.weken[i] = 0);
    }
    function getWorkDays(startDate,endDate){
      var days = 0;
      for (let date = new Date(startDate); date <= endDate;date.addDays(1)) {
        if ([1,2,3,4,5].includes(date.getDay())) {
          days++;
        }
      }
      return days;
    }

    const plantaken = taken.filter(task => task.resources && task.tegaan > 0.1);
    function plantaak(task) {
      const taskresources = task.resources.split(';').map(fullname => resources.find(resource => resource.fullname == fullname));
      const resourceTasks = [];
      taskresources.forEach(resource => {
        const resourcetask = Object.create(task);
        resourcetask.weken = [];
        weken.forEach((wk,i) => resourcetask.weken[i] = 0);
        resource.tasks.push(resourcetask);
        resourceTasks.push(resourcetask);
      });
      var tegaan = task.tegaan = task.tegaan || 0;
      task.budget = task.budget || 0;
      if (task.begin && task.eind) {
        var startDate = excelDateToJSDate(task.begin);
        startDate = new Date(Math.max(startDate, new Date()));
        const endDate = excelDateToJSDate(task.eind);
        var days = getWorkDays(startDate,endDate);
        const uren = tegaan / days / taskresources.length;
        // console.log(task.omschrijving,{tegaan,days,uren},taskresources.length);
        for (let date = new Date(startDate); date <= endDate; date.addDays(1)) {
          if ([1,2,3,4,5].includes(date.getDay())) {
            const i = weekindex(date);
            taskresources.forEach((resource,r) => {
              task.weken[i] += uren;
              resource.weken[i] += uren;
              resourceTasks[r].weken[i] += uren;
            });
          }
        }
      } else if (task.begin) {
        var startDate = excelDateToJSDate(task.begin);
        startDate = new Date(Math.max(startDate, new Date()));
        const startWeek = weekyear(startDate) - currentWeek;
        for (let i=startWeek;i<=planweken;i++) {
          taskresources.forEach((resource,r) => {
            const beschikbaar = Math.max(0,maxuren-resource.weken[i]);
            let uren = Math.min(beschikbaar,tegaan);
            tegaan -= uren;
            task.weken[i] += uren;
            resource.weken[i] += uren;
            resourceTasks[r].weken[i] += uren;
          });
        }
        // console.log(startWeek, item.weken, resource.weken);
      } else if (task.eind) {
        for (let date = excelDateToJSDate(task.eind); tegaan; date.addDays(-1)) {
          if ([1,2,3,4,5].includes(date.getDay())) {
            const i = weekindex(date);
            taskresources.forEach((resource,r) => {
              const beschikbaar = Math.max(0,maxuren-resource.weken[i]);
              let uren = Math.min(beschikbaar,tegaan);
              tegaan -= uren;
              task.weken[i] += uren;
              resource.weken[i] += uren;
              resourceTasks[r].weken[i] += uren;
            });
          }
        }
      } else {
        for (let i=0;i<planweken;i++) {
          taskresources.forEach((resource,r) => {
            const beschikbaar = Math.max(0,maxuren-resource.weken[i]);
            let uren = Math.min(beschikbaar,tegaan);
            tegaan -= uren;
            task.weken[i] += uren;
            resource.weken[i] += uren;
            resourceTasks[r].weken[i] += uren;
          });
        }
      }
    }

    plantaken.filter(task => task.begin && task.eind).forEach(plantaak);
    plantaken.filter(task => task.begin && !task.eind).forEach(plantaak);
    plantaken.filter(task => !task.begin && task.eind).forEach(plantaak);
    plantaken.filter(task => !task.begin && !task.eind).forEach(plantaak);

    // console.log(resources);
    function sorttasks(a,b) {
      return String(a.ordernr||'').localeCompare(b.ordernr||'') || String(a.orderdeel||'').localeCompare(b.orderdeel||'') || String(a.deel||'').localeCompare(b.deel||'') || String(a.activiteit||'').localeCompare(b.activiteit||'');
    }
    function tasktable(items) {
      items = (items||[]).flat(9);
      const totals = {budget:0,besteed:0,tegaan:0,resultaat:0};
      // console.log(items);

      return $('table').class('grid nowrap').append(
        $('thead').append(
          $('tr').append(
            'Order,Project,Activiteit,Omschrijving,Begin,Eind,Bud.,Bes.,ToGo,Res.,VG,Status,Resources'.split(',').map(title => $('th').text(title)),
            weken.map(nr => $('th').text(nr)),
          ),
        ),
        $('tbody').append(
          items.sort(sorttasks).map(item => $('tr').append(
            $('td').text([item.ordernr,item.orderdeel].filter(Boolean).join('.')).style('font-family:consolas;'),
            $('td').text([item.klant,item.projectnaam].filter(Boolean).join(' > ')),
            $('td').text(item.activiteit),
            $('td').text(item.deel,item.omschrijving),
            $('td').text(item.begin ? excelDateToJSDate(item.begin).toLocaleDateString('nl-NL', {year: 'numeric', month: '2-digit', day: '2-digit'}) : '').style('font-family:consolas;'),
            $('td').text(item.eind ? excelDateToJSDate(item.eind).toLocaleDateString('nl-NL', {year: 'numeric', month: '2-digit', day: '2-digit'}) : '').style('font-family:consolas;'),
            $('td').text(item.budget ? num(item.budget,0,totals.budget += item.budget) : '').style('text-align:right;'),
            $('td').text(item.besteed ? num(item.besteed,0,totals.besteed += item.besteed) : '').style('text-align:right;'),
            $('td').text(item.tegaan ? num(item.tegaan,0,totals.tegaan += item.tegaan) : '').style('text-align:right;'),
            $('td').text(item.resultaat ? num(item.resultaat,0,totals.resultaat += item.resultaat) : '').style('text-align:right;' + (item.resultaat < 0 ? 'color:red;' : '')),
            $('td').text(num(item.besteed / (item.besteed + (item.tegaan || 0)) * 100,0)+'%').style('text-align:right;'),
            $('td').text(item.status).class(item.status),
            $('td').text((item.resources||'').split(';').map(name => name.split(' ')[0]).join('/')),
            (item.weken||[]).map(aantal => $('td').text(aantal ? num(aantal,0) : '').style(aantal ? 'background:lightblue;color:black;padding:0;text-align:center;font-size:0.8em;Vertical-align:middle;' : '')),
          ).style(!item.tegaan ? 'opacity:0.6;' : '')),
          $('tr').append(
            $('td'),
            $('td'),
            $('td'),
            $('td'),
            $('td'),
            $('td'),
            $('td').text(num(totals.budget,0)).style('text-align:right;'),
            $('td').text(num(totals.besteed,0)).style('text-align:right;'),
            $('td').text(num(totals.tegaan,0)).style('text-align:right;'),
            $('td').text(num(totals.resultaat,0)).style('text-align:right;'),
            $('td'),
            $('td'),
            $('td'),
            weken.map((nr,i) => $('td').text(num(items.map(item => (item.weken||[])[i]).reduce((s,v) => s+(v||0), 0),0))),
          ),
        ),
      );
    }
    Web.treeview.append({
      Planning: {
        children: {
          Systems: {
            onclick() {
              $('.listview').clear().append(
                $('div').class('col').style('width:0;').append(
                  $('div').class('col').style('overflow:auto;flex:1 0 0;').append(
                    $('div').class('col').append(
                      $('details').append(
                        $('summary').text('Projecten'),
                        projecten.map(project => $('details').append(
                          $('summary').text(project.title).append($('sub').text(project.projectnr).style('margin-left:10px;')),
                          tasktable(productionorder.filter(order => order.projectnr == project.projectnr).map(order => taken.filter(uren => uren.ordernr == order.ordernr))),
                        )),
                      ),
                      $('details').append(
                        $('summary').text('Resources'),
                        resources.map(resource => $('details').append(
                          $('summary').text(resource.fullname).style('margin-left:10px;'),
                          tasktable(resource.tasks),
                        )),
                      ),
                      $('details').append(
                        $('summary').text('Analyse'),
                        $('details').style('background-color:white;color:black;').append(
                          $('summary').text('Projecten'),
                          $('ol').style('list-style-type:decimal;').append(
                            projecten.map(project => project.projectmanager).map(projectmanager => $('li').text(projectmanager).append(
                              $('ol').style('list-style-type:decimal;').append(
                                projecten.filter(project => project.projectmanager === projectmanager && project.projectnr && project.notes.length).map(project => $('li').text('Project',project.projectnr).append(
                                  $('ol').style('list-style-type:decimal;').append(
                                    project.notes.map(note => $('li').text(note)),
                                    Item.productionorder.filter(order => order.projectnr === project.projectnr && taken.filter(task => task.ordernr == order.ordernr && task.notes.length).length).map(order => $('li').text('Order',order.ordernr).append(
                                      $('ol').style('list-style-type:decimal;').append(
                                        taken.filter(task => task.ordernr == order.ordernr && task.notes.length)
                                        .sort(sorttasks)
                                        .map(task => $('li').text([task.orderdeel,task.deel,task.activiteit,task.omschrijving]).append(
                                          $('ol').style('list-style-type:decimal;').append(
                                            task.notes.map(note => $('li').text(note)),
                                          ),
                                        )),
                                      )
                                    )),
                                  ),
                                )),
                              ),
                            )),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            },
          },
          Weburen1: {
            onclick() {
              Aim.fetch('http://10.10.60.31/api/weburen_totaal').body({nrs:Item.task2.map(task => task.ordernr).filter(Boolean).join(',')}).post().then(body => {
                const {weburen_totaal} = body;
                console.log(weburen_totaal);
                weburen_totaal.forEach(uren => {
                  [Item.task2, Item.weburen].forEach(items => {
                    items.filter(item =>
                      item.ordernr == uren.ordernr &&
                      item.orderdeel == uren.orderdeel &&
                      item.activiteit == uren.activiteit &&
                      item.deel == uren.deel
                    ).forEach(item => item.besteed = uren.besteed);
                  })
                })
                Item.weburen.forEach(uren => {
                  [Item.task2].forEach(items => {
                    items.filter(item =>
                      item.ordernr == uren.ordernr &&
                      item.orderdeel == uren.orderdeel &&
                      item.activiteit == uren.activiteit &&
                      item.deel == uren.deel
                    ).forEach(item => {
                      uren.budget = item.budget;
                      uren.tegaan = item.tegaan;
                    });
                  })
                })

                // console.log(Item.task2.map(task => task.ordernr).filter(Boolean).join(','));
                Item.weburen.forEach(item => {
                  item.status = 'Niet in planning';
                  item.style = 'color:orange;'
                });

                Item.weburen.filter(item => Item.task2.find(task => task.ordernr == item.ordernr && task.orderdeel == item.orderdeel && task.activiteit == item.activiteit && task.deel == item.deel)).forEach(item => {
                  item.status = '';
                  item.style = '';
                })

                $('.listview').clear().append(
                  $('div').append(
                    $('table').append(
                      $('thead').append(
                        $('tr').append(
                          $('td').text('ordernr'),
                          $('td').text('orderdeel'),
                          $('td').text('deel'),
                          $('td').text('activiteit'),
                          $('td').text('fullname'),
                          $('td').text('budget'),
                          $('td').text('besteed'),
                          $('td').text('tegaan'),
                          $('td').text('uren'),
                          $('td').text('omschrijving'),
                          $('td').text('datum'),
                          $('td').text('status'),
                        ),
                      ),
                      $('tbody').append(
                        Item.weburen.map(item => $('tr').append(
                          $('td').text(item.ordernr),
                          $('td').text(item.orderdeel),
                          $('td').text(item.deel),
                          $('td').text(item.activiteit),
                          $('td').text(item.fullname),
                          $('td').text(item.budget),
                          $('td').text(item.besteed),
                          $('td').text(item.tegaan),
                          $('td').text(item.uren),
                          $('td').text(item.omschrijving),
                          $('td').text(new Date(item.datum.date).toLocaleDateString()),
                          $('td').text(item.status),
                        ).style(item.style)),
                      ),
                    ),
                  ),
                );
              });
            },
          },
        },
      },
    });
  }).finally(Web.search);
  Web.treeview.append({
    Exact: {
      children: {
        Projects: {
          async onclick() {
            const {project_active_all} = await Aim.fetch('http://10.10.60.31/api/project_active_all').get();
            console.log(project_active_all);
            const {projectActiveMutTotal} = await Aim.fetch('http://10.10.60.31/api/projectActiveMutTotal').get();
            console.log(projectActiveMutTotal);
            const {projectActiveMut} = await Aim.fetch('http://10.10.60.31/api/projectActiveMut').get();
            console.log(projectActiveMut);
            function n(v,d = 0){if(v) return num(v,d);}
            function projectMutTotal(project) {
              const mut = projectActiveMutTotal.filter(row => row.project === project.projectNr.trim());
              if (mut.length) {
                return $('details').append(
                  $('summary').append(
                    $('span').text('Uren').style('flex:0 0 315px;'),
                    $('span').text(n(mut.reduce((a,b)=>a+(b.aantal||0),0))).style('flex:0 0 80px;text-align:right;'),
                    $('span').text(n(mut.reduce((a,b)=>a+(b.apAantal||0),0))).style('flex:0 0 80px;text-align:right;'),
                    $('span').text(n(mut.reduce((a,b)=>a+(b.vcAantal||0),0))).style('flex:0 0 80px;text-align:right;'),
                  ),
                  mut.map(mut => $('details').append(
                    $('summary').append(
                      $('span').text(mut.activiteit || 'LEEG').style('flex:0 0 300px;'),
                      $('span').text(n(mut.aantal)).style('flex:0 0 80px;text-align:right;'),
                      $('span').text(n(mut.apAantal)).style('flex:0 0 80px;text-align:right;'),
                      $('span').text(n(mut.vcAantal)).style('flex:0 0 80px;text-align:right;'),
                    ),
                    projectActiveMut
                    .filter(row => row.project === project.projectNr.trim() && row.activiteit === mut.activiteit)
                    .map(row => $('div').style('display:flex;line-height:15px;').append(
                      $('span').text(row.medewerker).style('flex:0 0 323px;padding-left:25px;'),
                      $('span').text(n(row.aantal)).style('flex:0 0 80px;text-align:right;'),
                    )),
                  )),
                )
              }
            }
            function projectDetails(project) {
              return $('details').open(false).append(
                projectSummary(project),
                childs(project.projectNr),
                projectMutTotal(project),
              )
            }
            function projectSummary(project) {
              return $('summary').class('status'+project.status).append(
                $('span').class('projectnr').text(project.projectNr.trim()),
                $('span').text(project.description),
                project.geleverd ? $('i').class('isgeleverd') : null,
                project.garantie ? $('i').class('isgarantie') : null,
                // project.nacalculatie ? $('i').class('isnacalculatie') : null,
                $('span').class('projectmanager').text(project.projectManager),
                $('span').class('complete').text(project.complete+'%'),
                $('div').style('text-align:right;font-size:0.8em;font-family:consolas;').append(
                  $('span').text(project.startDate).style(`color:${project.status === 'A' && new Date(project.startDate).valueOf() > new Date().valueOf() ? 'blue' : 'gray'};`),
                  $('span').text(project.endDate).style(`margin-left:10px;color:${project.status === 'A' && new Date(project.endDate).valueOf() < new Date().valueOf() ? 'red' : 'gray'};`),
                )
                // $('span').text(project.endDate).style('font-size:0.8em;color:gray;'),
              );
            }
            function childs (parentProject) {
              return project_active_all.filter(row => row.parentProject === parentProject).map(projectDetails);
            }
            $('.listview').clear().append(
              $('div').class('col').style('width:0;').append(
                $('div').class('col').style('overflow:auto;flex:1 0 0;').append(
                  $('div').class('col dcount prj').append(
                    $('details').open(true).append(
                      $('summary').text('Klanten'),
                      project_active_all.filter(row => row.level === 0).map(row => row.debName).sort().unique().map(debName => $('details').open(false).append(
                        $('summary').text(debName || 'GEEN Debiteur naam'),
                        project_active_all.filter(row => row.level === 0 && row.debName === debName).map(project => $('details').append(
                          projectSummary(project),
                          childs(project.projectNr),
                          projectMutTotal(project),
                          // $('div').style('display:flex;margin-left:15px;border-top:solid 1px rgba(180,180,180,0.3);').append(
                          //   $('span').text('Totaal project').style('flex:0 0 330px;padding-left:15px;'),
                          //   $('span').text(n(projectActiveMutTotal.filter(row => row.topproject === project.topproject).reduce((a,b)=>a+(b.aantal||0),0),0)).style('flex:0 0 80px;text-align:right;'),
                          //   $('span').text(n(projectActiveMutTotal.filter(row => row.topproject === project.topproject).reduce((a,b)=>a+(b.apAantal||0),0),0)).style('flex:0 0 80px;text-align:right;'),
                          //   $('span').text(n(projectActiveMutTotal.filter(row => row.topproject === project.topproject).reduce((a,b)=>a+(b.vcAantal||0),0),0)).style('flex:0 0 80px;text-align:right;'),
                          // ),
                        )),
                      )),
                    ),
                  ),
                ),
              ),
            );
          },
        },
      },
    },
    Test: {
      children: {
        AnalyseEngineering: {
          onclick() {
            loadExcelData('http://10.10.60.31/engineering/Projects/Demo/966204.xlsx').then(async data => {
              console.log('a', data);
            });
          },
        },
        Calc1: {
          onclick() {
            loadExcelData('http://10.10.60.31/engineering/Projects/Demo/966204.xlsx').then(async data => {
              // console.log('a', data);
              data = await Aim.fetch('http://10.10.60.31/api/calc').query('ordernr',1).body(data).post()
              // console.log('a', data);
              var tot = 0;
              $('.listview').clear().append(
                $('div').append(
                  $('table').append(
                    $('tbody').append(
                      data.partslist.map(row => $('tr').append(
                        $('td').text(row.itemCode),
                        $('td').text(row.description),
                        $('td').text(row.qty).style('text-align:right;'),
                        $('td').text(num(row.salesPackagePrice)).style('text-align:right;'),
                        $('td').text(num(row.tot = row.qty * row.salesPackagePrice)).style('text-align:right;'),
                      )),
                      $('tr').append(
                        $('td'),
                        $('td').text('TOTAL'),
                        $('td'),
                        $('td'),
                        $('td').text(num(data.partslist.reduce((s,a) => s + a.tot, 0))).style('text-align:right;'),
                      ),
                    ),
                  ),
                ),
              );
            });
          },
        },
        Allseas: {onclick: () => companyprofile('allseas')},
        MHS: {onclick: () => companyprofile('material handling systems')},
        Shell: {onclick: () => companyprofile('shell')},
        Saipem: {onclick: () => companyprofile('saipem')},


        // Uren1: {
        //   onclick() {
        //     console.log(Item.task2,Item.urentaken);
        //     var s = [];
        //     Item.task2.forEach(task2 => {
        //       task2.resources = Item.urentaken.filter(urentaak => urentaak.ordernr == task2.ordernr && urentaak.orderdeel == task2.orderdeel && urentaak.activiteit == task2.activiteit && urentaak.deel == task2.deel).map(urentaak => urentaak.fullname).unique().join(';');
        //       s.push([task2.ordernr,task2.orderdeel,task2.fase,task2.deel,task2.activiteit,task2.resources].join("\t"));
        //     });
        //     console.log(s.join("\r\n"));
        //   },
        // },
      },
    },
  });
  // Web.search();
}, err => {
  console.error(err);
  $(document.body).append(
    $('div').text('Deze pagina is niet beschikbaar'),
  )
}));
