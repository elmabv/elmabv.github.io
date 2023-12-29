const serviceRoot = 'https://aliconnect.nl/v1';
const socketRoot = 'wss://aliconnect.nl:444';

Object.assign(String.prototype, {
  camelCase(){
    const camelCase = this.replace(/([A-Z]+)/g,(s,p1) => p1.toLowerCase() ).replace(/\(.*\)/g,'').replace(/\[.*\]/g,'').replace(/\s\s/g,' ').replace(/(_|\s)([a-z])/g, (s,p1,p2) => p2.toUpperCase() ).replace(/^([A-Z])/, (s,p1) => p1.toLowerCase() ).trim();
    // console.log(camelCase);
    return camelCase;
  },
})


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
  function menuclick(e, items, parent){
    e.stopPropagation();
    $('.pagemenu').el.style.display = 'none';
    setTimeout(() => $('.pagemenu').el.style.display = '');
    const index = items.findIndex(([title,item]) => item === this);
    // console.log(111, this, index);
    const prev = items[index-1];
    const next = items[index+1];
    // console.log(parent, items,this,index,prev,next);
    function par([title,chapter], level, items, parent) {
      return $('div').class('row').append(
        $('div').class('mw').append(
          $('div').class('').append(
            !chapter.image ? null : $('img').class('sideimage').src(chapter.image),
            !chapter.youtube ? null : $('iframe').class('sideimage').src('https://www.youtube.com/embed/'+chapter.youtube+'?autoplay=0&controls=0&mute=1&autoplay=1&loop=1&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&enablejsapi=1&wmode=opaque').attr('allowfullscreen','').attr('allow','autoplay;fullscreen'),
            !chapter.mp4 ? null : $('video').class('sideimage').attr('controls', '').append(
              $('source').type('video/mp4').src(chapter.mp4),
            ),
            $('h1').append(
              $('a').text(chapter.title || title).on('click', e => menuclick.call(chapter, e, items)),
            ),
            $('p').html((chapter.description||'').split('\n').join('\n\n').render()),
            level ? null : $('p').html((chapter.details||'').split('\n').join('\n\n').render()),
            $('div').class('row').append(
              level && chapter.contacts ? $('div').append(
                $('div').text('Voor meer informatie kunt u contact opnemen met:'),
                $('div').class('row contacts').append(
                  chapter.contacts.map(contact => Item.person.find(person => person.displayName === contact.displayName) || contact).map(contact => $('div').class('row').append(
                    $('img').src(contact.img),
                    $('div').append(
                      $('div').text(contact.displayName || contact.name),
                      contact.jobTitle ? $('div').text(contact.jobTitle).style('font-size:0.8em;') : null,
                      contact.mailaddress ? $('a').href('mailto:'+contact.mailaddress).text('Stuur mail') : null,
                      contact.mobile || contact.phone ? $('a').href('tel:'+(contact.mobile || contact.phone)).text(String(contact.mobile || contact.phone)) : null,
                    ),
                  ))
                ),
              ) : null,
            ),
            level && chapter.attributes ? $('table').append(
              Object.entries(chapter.attributes).map(([key,value]) => $('tr').append(
                $('th').text(key),
                $('td').text(value),
              ))
            ) : null,
            level && chapter.docs ? $('div').append(
              chapter.docs.map(doc => $('div').append(
                $('a').text((doc.href||'').split('/').pop().split('.').shift()).href(doc.href).target('doc'),
              ))
            ) : null,
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
          $('nav').class('row').append(
            $('div').class('row mw').append(
              prev ? $('a').text(prev[0]).on('click', e => menuclick.call(prev[1], e, items)) : null,
              parent ? $('a').text('Omhoog').style('margin-left:auto;margin-right:auto;').on('click', e => menuclick.call(parent, e, items)) : null,
              next ? $('a').text(next[0]).style('margin-left:auto;').on('click', e => menuclick.call(next[1], e, items)) : null,
            ),
          ),
          par([null,this], true, items),
          Object.entries(this.children||{}).map((item,i,items) => par(item, false, items)),
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
            for (var c=0; c<=col_index; c++) {
              var cell = wbsheet[XLSX.utils.encode_cell({c,r:0})];
              if (cell) {
                colnames[c] = String(cell.v);
              }
            }
            for (var r=1;r<rowcount;r++) {
              const row = {};
              for (var c=0; c<=col_index; c++) {
                var cell = wbsheet[XLSX.utils.encode_cell({c,r})];
                if (cell) {
                  row[String(colnames[c]).camelCase()] = row[colnames[c]] = cell.v;
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

  const {engiro} = await loadExcelData('http://10.10.60.31/docs/data.xlsx');
  console.log({engiro});
  sitetree.Technology.children.Motors.children.Engiro.children = engiro.map(item => item.cool).unique().map(title => Object({
    title,
    children: engiro.filter(item => item.cool === title).map(({type,image,href,length,weight,w,kw,rpm,nm,v}) => Object({
      title: type,
      image,
      docs: [{href}],
      attributes: {length,weight,w,type,kw,rpm,nm,v},
    }))
  }));
  // engiro.forEach(item => {
  //   sitetree.Technology.children.Motors.children.Engiro.children.push({
  //     title: item.type,
  //   });
  // })
  await loadExcelData('http://10.10.60.31/docs/it.xlsx');

  const indienst = Item.person.filter(item => item.status === 'indienst');
  const jobtitles = Item.jobTitle;//.filter(item => indienst.some(person => person.jobTitle === item.jobTitle));
  // console.log(jobtitles);
  if (sitetree) {
    console.log(Item.competence);
    const competentie = sitetree.Technology.children.Competentie = {children:[]};
    Item.competence.forEach(competence => {
      competentie.children[competence.brand] = competentie.children[competence.brand] || {
        title: competence.brand,
        children: [],
      };
      competentie.children[competence.brand].children[competence.name] = competence;
    })


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
        Object.entries(sitetree).map(([title,l1],i,items) => $('li').append(
          $('a').text((l1||{}).title || title).on('click', e => menuclick.call(l1, e, items)),
          $('ul').append(
            Object.entries((l1||{}).children||[]).map(([title,l2],i,items) => $('li').append(
              $('a').text((l2||{}).title || title).on('click', e => menuclick.call(l2, e, items, l1)),
              $('ul').append(
                Object.entries((l2||{}).children||[]).map(([title,l3],i,items) => $('li').append(
                  $('a').text((l3||{}).title || title).on('click', e => menuclick.call(l3, e, items, l2)),
                  $('ul').append(
                    Object.entries((l3||{}).children||[]).map(([title,l4],i,items) => $('li').append(
                      $('a').text((l4||{}).title || title).on('click', e => menuclick.call(l4, e, items, l3)),
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

  parser = new DOMParser();
  xmlDoc = parser.parseFromString(await Aim.fetch('http://10.10.60.31/engineering/Projects/Planning/planning-engineering.xml').get(),"text/xml");

  console.log(xmlDoc);
  const taskElements = xmlDoc.getElementsByTagName("Task");//[0].childNodes[0].nodeValue;
  console.log(taskElements, JSON.stringify(taskElements));

  const wartsila = await loadExcelData('http://10.10.60.31/engineering/Projects/Klantspecifiek/Wartsila/Order List Overview 2023.xlsx');
  console.log({wartsila});

  const systems = await loadExcelData('http://10.10.60.31/engineering/Projects/elma-systems.xlsx');
  console.log({systems});

  function contactlist(contactlist){
    return $('table').class('grid').style('width:100%;').append(
      $('thead').append(
        $('th').text('Company'),
        $('th').text('Job title / Role'),
        $('th').text('Name'),
        $('th').text('Initials'),
        $('th').text('Mail address'),
        $('th').text('Mobile'),
      ),
      $('tbody').append(
        contactlist.map(item => $('tr').append(
          $('td').text(item.Company),
          $('td').text(item.Role || item.JobTitle),
          $('td').text(item.Name),
          $('td').text(item.Init),
          $('td').append($('a').text(item.Mailaddress).href('mailto:'+item.Mailaddress)),
          $('td').append($('a').text(item.Mobile).href('tel:'+item.Mobile)),
        ))
      )
    )

  }

  async function handboek(systems) {
    $('.listview').clear().append(
      $('div').class('col').style('width:0;').append(
        $('div').class('col').style('overflow:auto;flex:1 0 0;').append(
          $('h1').text('Contactlist'),
          contactlist(systems.contactlist),
          $('h1').text('Checklist'),
          systems.checklist.map(item => $('details').append(
            $('summary').text(item.Onderwerp),
            $('p').text(item.Toelichting),
          ))
        )
      )
    );
  }


  async function systemspecs(system) {
    // const mteck = await Aim.fetch('https://aliconnect.nl/elmabv/api/mteck').get();
    Object.assign(system, await Aim.fetch('https://aliconnect.nl/elmabv/api/mteck').get());
    Object.assign(system, await loadExcelData('http://10.10.60.31/engineering/Engineering/Engineering/MTECK/mteck-systems-tcd.xlsx'));
    Object.assign(system, await loadExcelData('http://10.10.60.31/engineering/Projects/'+system.infofile));

    system.contactlist.forEach(item => Object.assign(item, systems.contactlist.find(row => row.Name === item.Name)))
    system.checklist.forEach(item => Object.assign(item, systems.checklist.find(row => row.Onderwerp === item.Onderwerp)))

    system.alarmGroups = [];
    system.alarmen = [];
    for (let bron of system.documenten.filter(item => item.Name === 'Alarm Lijst' && item.Bron).map(item => item.Bron)) {
      const sheet = await loadExcelSheet('http://10.10.60.31/engineering/Projects/' + system.projectfolder + '/' + bron);
      system.alarm = sheet.Alarm;
      system.alarmGroups = sheet.AlarmGroups;
    }

    system.iolist = [];
    for (let bron of system.documenten.filter(item => item.Name === 'Software IO Lijst' && item.Bron).map(item => item.Bron)) {
      const sheet = await loadExcelSheet('http://10.10.60.31/engineering/Projects/' + system.projectfolder + '/' + bron);
      system.iolist = sheet['IO lijst'];
      system.iolist.forEach(item => {
        item.cabinet = item.group;
        item.description = (item.description||'').trim();
        if (item.type === 'DQ') item.address = 'Q'+item.adres;
        if (item.type === 'DI') item.address = 'I'+item.adres;
        if (item.type === 'PIW') item.address = 'PIW'+item.adres;
        if (item.type === 'PQW') item.address = 'PQW'+item.adres;
        item.id = [item.cabinet,item.address].join('.').toUpperCase();
        item.connectionName = [item.type,item.nr].join(' ');
      })
    }

    system.eplaniolist = [];
    for (let bron of system.documenten.filter(item => item.Name === 'Eplan IO Lijst' && item.Bron).map(item => item.Bron)) {
      const sheet = await loadExcelSheet('http://10.10.60.31/engineering/Projects/' + system.projectfolder + '/' + bron);
      system.eplaniolist = sheet['EplSheet'];
      // console.log(system.eplaniolist);
      system.eplaniolist.forEach((item,i) => item.i = i);
      system.eplaniolist.filter(item => item.plcAddress && item.pageName).forEach(item => {
        item.cabinet = item.pageName.split('/')[0];
        item.address = item.plcAddress;
        if (item.connectionPointDescriptions.match(/^di/i) && !item.address.match(/^i/i)) item.address = 'I'+item.address;
        if (item.connectionPointDescriptions.match(/^dq/i) && !item.address.match(/^q/i)) item.address = 'Q'+item.address;
        if (item.connectionPointDescriptions.match(/^i/i) && !item.address.match(/^i/i)) item.address = 'I'+item.address;
        if (item.connectionPointDescriptions.match(/^q/i) && !item.address.match(/^q/i)) item.address = 'Q'+item.address;
        item.id = [item.cabinet,item.address].join('.').toUpperCase();
      })
    }

    system.plctags = [];
    for (let bron of system.documenten.filter(item => item.Name === 'PLC Tags' && item.Bron).map(item => item.Bron)) {
      const sheet = await loadExcelSheet('http://10.10.60.31/engineering/Projects/' + system.projectfolder + '/' + bron);
      system.plctags = sheet['PLC Tags'];
      system.plctags.forEach(item => {
        item.cabinet = item.path.split(',')[0];
        item.address = item.logicalAddress.replace('%','');
        item.id = [item.cabinet,item.address].join('.').toUpperCase();
      })
    }

    system.eplaniolist.forEach(item => {
      item.connectionName = item.connectionPointDescriptions;
      item.description = item.functionTextEnUs = (item.functionTextEnUs||'').replace(/\n/g,' ');
      system.iolist.filter(row => row.id === item.id).forEach(iolist => {
        item.iolistItem = iolist;
        item.connectionName = iolist.connectionName;
        item.description = iolist.description;
      })
    })

    console.log(system.iolist,system.eplaniolist);

    console.log({system});

    $('.listview').clear().append(
      $('div').class('col').style('width:0;').append(
        $('div').class('col dcounter').style('overflow:auto;flex:1 0 0;').append(
          $('h1').text(system.title),
          $('details').append(
            $('summary').text('Project eigenschappen'),
            $('table').class('grid').style('width:100%;').append(
              $('tbody').append(
                system.info.map(item => $('tr').append(
                  $('th').text(item.property),
                  $('td').text(item.value),
                ))
              )
            ),
          ),
          $('details').append(
            $('summary').text('Revisie overzicht'),
            $('table').class('grid').style('width:100%;').append(
              $('thead').append(
                $('th').text('Versie'),
                $('th').text('Datum'),
                $('th').text('Auteur'),
                $('th').text('Omschrijving'),
              ),
              $('tbody').append(
                system.revisions.map(item => $('tr').append(
                  $('td').text(item.revision),
                  $('td').text(item.date),
                  $('td').text(item.author),
                  $('td').text(item.description),
                ))
              )
            ),
          ),

          $('details').append(
            $('summary').text('Contact overzicht'),
            contactlist(system.contactlist),
          ),
          $('details').append(
            $('summary').text('Documenten overzicht'),
            $('table').class('grid').style('width:100%;').append(
              $('thead').append(
                $('th').text('Name'),
                $('th').text('Pdf'),
                $('th').text('Versie'),
                $('th').text('Datum'),
              ),
              $('tbody').append(
                system.documenten.map(item => $('tr').append(
                  $('td').text(item.Name),
                  $('td').append($('a').target('document').text('PDF').href('http://10.10.60.31/engineering/Projects/' + system.projectfolder + '/' + item.pdf)),
                  $('td').text(item.Version),
                  $('td').text(item.Date),
                ))
              )
            ),
          ),
          $('details').append(
            $('summary').text('Check lijst'),
            system.checklist.map(item => $('details').append(
              $('summary').text(item.Onderwerp),
              $('p').text(item.Toelichting),
            )),
          ),
          $('details').append(
            $('summary').text('Eplan IO lijst'),
            $('table').class('grid').style('width:100%;font-family:consolas;').append(
              $('thead').append(
                // $('th').text('#'),
                // $('th').text('ID'),
                $('th').text('Kast'),
                $('th').text('DT'),
                $('th').text('Name'),
                $('th').text('Name1'),
                $('th').text('Pin'),
                $('th').text('Address'),
                $('th').text('Description'),
                $('th').text('Current Description'),
              ),
              $('tbody').append(
                system.eplaniolist.filter(item => item.id).map((item,i) => $('tr').append(
                  // $('td').text(item.i),
                  // $('td').text(item.id),
                  $('td').text(item.cabinet),
                  $('td').text(item.dt),
                  $('td').text(item.connectionName).style(item.connectionName !== item.connectionPointDescriptions ? 'color:red;' : null),
                  $('td').text(item.connectionName !== item.connectionPointDescriptions ? item.connectionPointDescriptions : null),
                  $('td').text(item.connectionPointDesignations),
                  $('td').text(item.address).style(item.address !== item.plcAddress ? 'color:red;' : null),
                  $('td').text(item.description).style(item.description != item.functionTextEnUs ? 'color:red;' : null),
                  $('td').text(item.description != item.functionTextEnUs ? item.functionTextEnUs : null),
                ))
              ),
            ),
          ),
          $('details').append(
            $('summary').text('IO lijst'),
            system.iolist.map(item => item.Location+' - '+item.Group).unique().map(name => $('details').append(
              $('summary').text(name),
              $('table').class('grid').style('width:100%;font-family:consolas;').append(
                $('thead').append(
                  // $('th').text('Location'),
                  $('th').text('ID'),
                  $('th').text('ODC'),
                  $('th').text('Description'),
                  $('th').text('Name'),
                  $('th').text('Klem'),
                  // $('th').text('Pin'),
                  $('th').text('Component'),
                  $('th').text('Software'),
                ),
                $('tbody').append(
                  system.iolist.filter(item => item.Location+' - '+item.Group === name).map(item => $('tr').append(
                    // $('td').text(item.Location),
                    $('td').text(item.id),
                    $('td').text(item.ODC),
                    $('td').text(item.Description),
                    $('td').text(item.Type+item.Pin),
                    $('td').text(item.adres),
                    // $('td').text(String(item.Pin).padStart(2,'0')),
                    $('td').text(item.Component),
                    $('td').text(item.iolistItem ? item.iolistItem.description : 'Not found'),
                  ))
                )
              ),
            )),
          ),
          $('details').append(
            $('summary').text('Alarm lijst'),
            system.alarmGroups.map(group => $('details').append(
              $('summary').text(group.Name),
              $('table').class('grid').style('width:100%;').append(
                $('thead').append(
                  $('th').text('Nr'),
                  // $('th').text('Tag'),
                  $('th').text('Description'),
                  $('th').text('Component'),
                ),
                $('tbody').append(
                  system.alarm.filter(item => item[group.Name] === 'x').map(item => $('tr').append(
                    $('td').text(item.Nr),
                    // $('td').text(item.Tag),
                    $('td').text(item.Description),
                    $('td').text(item.Component),
                  ))
                )
              ),
            )),
          ),
        )
      )
    )

    // const mteck2100e = await loadExcelData('http://10.10.60.31/engineering/Projects/2023/20235054 Mteck 2100E Dragline USA 2210/08-Software/20235054-system-design.xlsx');
    // console.log({mteck2100e});
  }
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
    Systems: {
      children: {
        Handboek: {
          onclick() {
            handboek(systems);
          },
        }
      }
    },
    Projecten: {
      children: Object.fromEntries(systems.systems.map(system => [system.title,{
        onclick() {
          systemspecs(system);
        },
      }])),
    },
  });
}, err => {
  console.error(err);
  $(document.body).append(
    $('div').text('Deze pagina is niet beschikbaar'),
  )
}));
