const serviceRoot = 'https://aliconnect.nl/v1';
const socketRoot = 'wss://aliconnect.nl:444';

Object.assign(String.prototype, {
  camelCase(){
    const camelCase = this.replace(/([A-Z][A-Z]+)/g,(s,p1) => p1.toLowerCase() ).replace(/\(.*\)/g,'').replace(/\[.*\]/g,'').replace(/\s\s/g,' ').replace(/(_|\s)([a-zA-Z])/g, (s,p1,p2) => p2.toUpperCase() ).replace(/^([A-Z])/, (s,p1) => p1.toLowerCase() ).trim();
    // console.log(camelCase);
    return camelCase;
  },
})

Web.on('loaded', (event) => Abis.config({serviceRoot,socketRoot}).init({
  configfiles: [
    'https://aliconnect.nl/elmabv/api/elma',
    // 'https://aliconnect.nl/elmabv/api/elma-site',
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
    const index = items.findIndex(item => item === this);
    // console.log(111, this, index);
    const prev = items[index-1];
    const next = items[index+1];
    // console.log(parent, items,this,index,prev,next);
    function par(chapter, level, items, parent) {
      console.log(chapter);
      return $('div').class('row').append(
        $('div').class('mw').append(
          $('div').class('').append(
            !chapter.image ? null : $('img').class('sideimage').src(chapter.image),
            !chapter.youtube ? null : $('iframe').class('sideimage').src('https://www.youtube.com/embed/'+chapter.youtube+'?autoplay=0&controls=0&mute=1&autoplay=1&loop=1&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&enablejsapi=1&wmode=opaque').attr('allowfullscreen','').attr('allow','autoplay;fullscreen'),
            !chapter.mp4 ? null : $('video').class('sideimage').attr('controls', '').append(
              $('source').type('video/mp4').src(chapter.mp4),
            ),
            $('h1').append(
              $('a').text(chapter.title).on('click', e => menuclick.call(chapter, e, items)),
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
      // console.log(this);
      $('main.row').clear().append(
        $('div').class('col chapters').append(
          $('nav').class('row').append(
            $('div').class('row mw').append(
              prev ? $('a').text(prev[0]).on('click', e => menuclick.call(prev[1], e, items)) : null,
              parent ? $('a').text('Omhoog').style('margin-left:auto;margin-right:auto;').on('click', e => menuclick.call(parent, e, items)) : null,
              next ? $('a').text(next[0]).style('margin-left:auto;').on('click', e => menuclick.call(next[1], e, items)) : null,
            ),
          ),
          par(this, true, items),
          this.children.map((item,i,items) => par(item, false, items)),
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
                  row[String(colnames[c]).camelCase()] = cell.v;
                  // row[colnames[c]] = cell.v;
                }
              }
              rows.push(row);
            }
            data[schemaName.camelCase()] = rows;
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

  // sitetree.Technology.children.Motors.children.Engiro.children = engiro.map(item => item.cool).unique().map(title => Object({
  //   title,
  //   children: engiro.filter(item => item.cool === title).map(({type,image,href,length,weight,w,kw,rpm,nm,v}) => Object({
  //     title: type,
  //     image,
  //     docs: [{href}],
  //     attributes: {length,weight,w,type,kw,rpm,nm,v},
  //   }))
  // }));
  // engiro.forEach(item => {
  //   sitetree.Technology.children.Motors.children.Engiro.children.push({
  //     title: item.type,
  //   });
  // })
  await loadExcelData('http://10.10.60.31/docs/it.xlsx');

  const elma = await loadExcelSheet('http://10.10.60.31/engineering/elma.xlsx');
  let engineering = await loadExcelSheet('http://10.10.60.31/engineering/Engineering/engineering.xlsx');
  const projects = await loadExcelSheet('http://10.10.60.31/engineering/Projects/projects.xlsx');
  const project = await loadExcelSheet('http://10.10.60.31/engineering/Projects/project-cmdb.xlsx');

  const indienst = elma.person.filter(item => !item.uitdienst && item.companyName === 'Elma BV');
  const jobtitles = elma.jobTitle;//.filter(item => indienst.some(person => person.jobTitle === item.jobTitle));

  elma.person.forEach(item => {
    item.init = item.init || (String(item.displayName).substr(0,1) + String(item.displayName).split(' ').pop().substr(0,2)).toUpperCase();
  })
  elma.jobTitle.forEach(item => {
    item.totalfte = indienst.filter(person => person.jobTitle === item.jobTitle).length;
  })

  loaddata(elma);

  if (elma.site) {
    elma.site.children = elma.site.filter(row => !row.kop2);
    elma.site.children.forEach((item,i,items) => {
      item.title = item.kop1;
      item.children = elma.site.filter(row => row.kop1 === item.kop1 && row.kop2 && !row.kop3);
      item.children.forEach(child => child.parent = item);
      item.children.forEach(child => child.parentChildren = items);
      item.children.forEach((item,i,items) => {
        item.title = item.kop2;
        item.children = elma.site.filter(row => row.kop1 === item.kop1 && row.kop2 === item.kop2 && row.kop3 && !row.kop4);
        item.children.forEach(child => child.parent = item);
        item.children.forEach(child => child.parentChildren = items);
        item.children.forEach((item,i,items) => {
          item.title = item.kop3;
          item.children = elma.site.filter(row => row.kop1 === item.kop1 && row.kop2 === item.kop2 && row.kop3 === item.kop3 && row.kop4);
          item.children.forEach(child => child.parent = item);
          item.children.forEach(child => child.parentChildren = items);
          item.children.forEach(row => {
            item.title = item.kop4;
            item.children = [];
            item.children.forEach(child => child.parent = item);
            item.children.forEach(child => child.parentChildren = items);
          });
        });
      });
    });
    // console.log(elma.site);
    $('.pagemenu').append(
      $('ul').append(
        elma.site.children.map((item,i,items) => $('li').append(
          $('a').text(item.kop1).on('click', e => menuclick.call(item, e, items)),
          $('ul').append(
            item.children.map((item,i,items) => $('li').append(
              $('a').text(item.kop2).on('click', e => menuclick.call(item, e, items)),
              $('ul').append(
                item.children.map((item,i,items) => $('li').append(
                  $('a').text(item.kop3).on('click', e => menuclick.call(item, e, items)),
                  $('ul').append(
                    item.children.map((item,i,items) => $('li').append(
                      $('a').text(item.kop4).on('click', e => menuclick.call(item, e, items)),
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

    // elma.site.filter(item => !item.kop2).forEach(item => item.children = elma.site.filter(row => row.kop3row.parent === item.title));
    // function writetree(items,level = 0){
    //   if (items.length) return $('ul').append(
    //     items.map(item => $('li').append(
    //       $('a').text(item.title).on('click', e => menuclick.call(item, e, items)),
    //       writetree(item.children),
    //       // level > 2 ? null : writetree(elma.site.filter(row => row.parent === item.title), level + 1),
    //     )),
    //   )
    // }
    // $('.pagemenu').append(writetree(elma.site.filter(item => !item.kop2)));
    //   $('ul').append(
    //     Object.entries(sitetree).map(([title,l1],i,items) => $('li').append(
    //       $('a').text((l1||{}).title || title).on('click', e => menuclick.call(l1, e, items)),
    //       $('ul').append(
    //         Object.entries((l1||{}).children||[]).map(([title,l2],i,items) => $('li').append(
    //           $('a').text((l2||{}).title || title).on('click', e => menuclick.call(l2, e, items, l1)),
    //           $('ul').append(
    //             Object.entries((l2||{}).children||[]).map(([title,l3],i,items) => $('li').append(
    //               $('a').text((l3||{}).title || title).on('click', e => menuclick.call(l3, e, items, l2)),
    //               $('ul').append(
    //                 Object.entries((l3||{}).children||[]).map(([title,l4],i,items) => $('li').append(
    //                   $('a').text((l4||{}).title || title).on('click', e => menuclick.call(l4, e, items, l3)),
    //                 ))
    //               )
    //               // $('a').text(l3.title).on('click', menuclick.bind(l3)),
    //             ))
    //           )
    //         ))
    //       )
    //     ))
    //   )
    // )
  }

  if (0 && sitetree) {
    // console.log(Item.competence);
    // const competentie = sitetree.Technology.children.Competentie = {children:[]};
    // Item.competence.forEach(competence => {
    //   competentie.children[competence.brand] = competentie.children[competence.brand] || {
    //     title: competence.brand,
    //     children: [],
    //   };
    //   competentie.children[competence.brand].children[competence.name] = competence;
    // })


    // sitetree.Organisatie.children.Elma = {
    //   children: indienst.map(item => item.department).unique().sort().map(department => Object({
    //     title: department,
    //     children: indienst.filter(item => item.department === department).map(item => item.jobTitle).unique().sort().map(jobTitle => Object({
    //       title: jobTitle,
    //       children: indienst.filter(item => item.department === department && item.jobTitle === jobTitle).map(item => Object({
    //         title: item.id,
    //       }))
    //     })),
    //   }))
    // }
    // sitetree.Organisatie.children.JobTitles = {
    //   children: jobtitles.map(item => item.department).unique().sort().map(department => Object({
    //     title: department,
    //     children: jobtitles.filter(item => item.department === department).map(jobTitle => Object({
    //       title: jobTitle.jobTitle,
    //       description: jobTitle.department,
    //     })),
    //   }))
    // }

    const el = $('table').class('grid').parent(docpage());
    // function addrow([title,item],i,items){
    //   if (item) {
    //     el.append($('tr').append(
    //       $('td').text(item.parent),
    //       $('td').text(title = item.title || title),
    //       $('td').text(item.header),
    //       // $('td').text(item.title),
    //       $('td').text((item.description||'').replace(/\n/g, '<br>')),
    //       // $('td').text(item.description),
    //       $('td').text(item.image),
    //       $('td').text(item.youtube),
    //       $('td').text(item.price),
    //     ))
    //     if (item.children) {
    //       Object.entries(item.children).filter(([p1,item]) => item).forEach(([p1,item]) => item.parent = title);
    //       Object.entries(item.children).filter(([p1,item]) => item).forEach(addrow);
    //     }
    //   }
    // }
    // Object.entries(sitetree).forEach(addrow);

    Object.entries(sitetree).filter(([p,item])=>item).forEach(([title1,item],i,items) => {
      el.append($('tr').append(
        // $('td').text(title1 = item.title || title1),
        $('td').text(title1 = item.title || title1),
        $('td'),
        $('td'),
        $('td'),
        $('td').text(item.header),
        // $('td').text(item.title),
        $('td').text((item.description||'').replace(/\n/g, '<br>')),
        // $('td').text(item.description),
        $('td').text(item.image),
        $('td').text(item.youtube),
        $('td').text(item.price),
      ))
      Object.entries((item||{}).children||[]).filter(([p,item])=>item).forEach(([title2,item],i,items) => {
        el.append($('tr').append(
          $('td').text(title1),
          $('td').text(title2 = item.title || title2),
          $('td'),
          $('td'),
          // $('td').text(title1 = item.title || title1),
          $('td').text(item.header),
          // $('td').text(item.title),
          $('td').text((item.description||'').replace(/\n/g, '<br>')),
          // $('td').text(item.description),
          $('td').text(item.image),
          $('td').text(item.youtube),
          $('td').text(item.price),
        ))
        Object.entries((item||{}).children||[]).filter(([p,item])=>item).forEach(([title3,item],i,items) => {
          el.append($('tr').append(
            $('td').text(title1),
            $('td').text(title2),
            // $('td').text(title3 = item.title || title3),
            $('td').text(title3 = item.title || title3),
            $('td'),
            $('td').text(item.header),
            // $('td').text(item.title),
            $('td').text((item.description||'').replace(/\n/g, '<br>')),
            // $('td').text(item.description),
            $('td').text(item.image),
            $('td').text(item.youtube),
            $('td').text(item.price),
          ))
          Object.entries((item||{}).children||[]).filter(([p,item])=>item).forEach(([title4,item],i,items) => {
            el.append($('tr').append(
              $('td').text(title1),
              $('td').text(title2),
              $('td').text(title3),
              // $('td').text(),
              $('td').text(title4 = item.title || title4),
              $('td').text(item.header),
              // $('td').text(item.title),
              $('td').text((item.description||'').replace(/\n/g, '<br>')),
              // $('td').text(item.description),
              $('td').text(item.image),
              $('td').text(item.youtube),
              $('td').text(item.price),
            ))
          })
        })
      })
    })



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

  // const projects = await loadExcelData('http://10.10.60.31/engineering/Projects/elma-projects.xlsx');
  // console.log({projects});

  function excelDate(datum){
    if (datum) return excelDateToJSDate(datum).toLocaleDateString();
  }
  function details(title, open) {
    return $('details').open(open).append(
      $('summary').text(title),
    );
  }
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
          $('td').text(item.companyName),
          $('td').text(item.role || item.jobTitle),
          $('td').text(item.displayName),
          $('td').text(item.init),
          $('td').append($('a').text(item.mailaddress).href('mailto:'+item.mailaddress)),
          $('td').append($('a').text(item.mobile).href('tel:'+item.mobile)),
        ))
      )
    )
  }
  function docpage(){
    return $('div').class('col dcounter').style('overflow:auto;flex:1 0 0;').parent(
      $('div').class('col').style('width:0;').parent(
        $('.listview').clear()
      )
    );
  }
  function table(columns){
    return $('table').class('grid').style('width:100%;');
  }

  async function mom(items) {
    docpage().append(
      $('h1').text('MOM Engineering', new Date().toLocaleDateString()),
      $('ol').append(
        items.map((item,i) => $('li').append(
          $('b').text([
            // item.afdeling,
            item.klant,
            item.project,
            item.deel,
            item.onderwerp,
          ].filter(Boolean).join(' > ')),
          $('div').text(item.projectnr, item.owner, item.cc).style('opacity:0.6;'),
          $('div').text(item.toelichting),
          $('div').text(excelDate(item.lastModifiedDate), item.status),
          $('div').text(item.actie, item.door),
          $('div').text(item.besluit),
          // $('div').text(item.owner).style('font-size:0.8em;white-space:nowrap;'),
          $('div').text(excelDate(item.deadline)).style('white-space:nowrap;'),
        ))
      ),
      // $('table').class('grid').append(
      //   $('thead').append(
      //     $('th').text('Nr'),
      //     $('th').text('Onderwerp').style('width:100%;'),
      //     $('th').text('Owner'),
      //     $('th').text('Deadline'),
      //   ),
      //   $('tbody').append(
      //     items.map((item,i) => $('tr').append(
      //       $('td').text(i+1),
      //       $('td').append(
      //         $('b').text([item.afdeling, item.klant, [item.projectnr,item.project].filter(Boolean).join(' '), item.onderwerp].filter(Boolean).join(' > ')),
      //         $('div').text(item.toelichting),
      //         $('div').text(item.status),
      //         $('div').text(item.actie),
      //         $('div').text(item.besluit),
      //       ),
      //       $('td').text(item.owner).style('font-size:0.8em;white-space:nowrap;'),
      //       $('td').text(excelDate(item.deadline)).style('white-space:nowrap;'),
      //     ))
      //   ),
      // ),
    )
  }

  async function handboek(projects) {
    docpage().append(
      $('h1').text('Handboek'),
      details('Afkortingen').append(
        table().append(
          $('thead').append(
            $('th').text('Afkorting'),
            $('th').text('Titel (Omschrijving)'),
            // $('th').text('Omschrijving'),
          ),
          $('tbody').append(
            Item.afkortingen.map(item => $('tr').append(
              $('td').text(item.afkorting),
              $('td').append(item.titel, $('div').text(item.omschrijving).style('font-size:0.8em;')),
            ))
          )
        ),
      ),
      details('Job titles').append(
        table().append(
          $('thead').append(
            $('th').text('Job title'),
            $('th').text('Department'),
            $('th').text('Function code'),
            $('th').text('In dienst'),
            $('th').text('Status'),
            // $('th').text('Omschrijving'),
          ),
          $('tbody').append(
            Item.jobTitle.sort((a,b) => a.jobTitle.localeCompare(b.jobTitle)).map(item => $('tr').append(
              $('td').text(item.jobTitle),
              $('td').text(item.department),
              $('td').text(item.functionCode),
              $('td').text(item.totalfte || ''),
              $('td').text(item.status),
              // $('td').append(item.titel, $('div').text(item.omschrijving).style('font-size:0.8em;')),
            ))
          )
        ),
      ),
      details('Elma medewerkers').append(
        contactlist(Item.person.filter(item => !item.uitdienst && item.companyName === 'Elma BV').sort((a,b) => a.displayName.localeCompare(b.displayName))),
      ),
      details('Overlegstructuur').append(
        table().append(
          $('thead').append(
            $('th').text('Overleg'),
            $('th').text('Dag'),
            $('th').text('Start'),
            $('th').text('Duur'),
            $('th').text('Aanwezig'),
          ),
          $('tbody').append(
            elma.overlegstructuur.map(item => $('tr').append(
              $('th').text(item.overleg),
              $('td').text(item.dag),
              $('td').text(excelDateToJSDate(item.start).toLocaleTimeString()),
              $('td').text(item.duur),
              $('td').text(item.aanwezig),
            ))
          )
        ),
      ),
      details('Project Configuratie Database').append(
        details('Info velden').append(
          table().append(
            $('thead').append(
              $('th').text('Eigenschap'),
              $('th').text('Toelichting').style('width:100%;'),
              $('th').text('Fase'),
              $('th').text('Wie'),
              $('th').text('Type'),
            ),
            $('tbody').append(
              project.projectinfo.map(item => $('tr').append(
                $('th').text(item.property),
                $('td').text(item.toelichting),
                $('td').text(item.faseNr),
                $('td').text(item.verantwoordelijke),
                $('td').text(item.type),
              ))
            )
          ),
        ),
        details('Fasering').append(
          project.projectfasen.map(fase => $('details').append(
            $('summary').text(fase.fase),
            $('table').class('grid').style('width:100%;').append(
              $('thead').append(
                $('th').text('Onderwerp'),
                $('th').text('Verantwoordelijke'),
              ),
              $('tbody').append(
                project.checklist.filter(row => row.fase === fase.fase).map(item => $('tr').append(
                  $('td').text(item.onderwerp),
                  $('td').text(item.verantwoordelijke),
                ))
              )
            ),
          )),
        ),
        details('Contactlijst').append(
          table().append(
            $('thead').append(
              $('th').text('Organisatie'),
              $('th').text('Afk'),
              $('th').text('Rol'),
              $('th').text('Omschrijving'),
            ),
            $('tbody').append(
              project.contactlist.map(item => $('tr').append(
                $('td').text(item.organisatie),
                $('td').text(item.afk),
                $('td').text(item.role),
                $('td').text(item.omschrijving),
              ))
            )
          ),
        ),
        details('Documenten').append(
          table().append(
            $('thead').append(
              $('th').text('Naam'),
              $('th').text('Fase'),
            ),
            $('tbody').append(
              project.documenten.map(item => $('tr').append(
                $('td').text(item.name),
                $('td').text(item.fase),
              ))
            )
          ),
        ),
        details('Checklist').append(
          project.checklist.map(item => $('details').append(
            $('summary').text(item.Onderwerp),
            $('p').text(item.Toelichting),
          )),
        ),
      ),
    )
  }
  async function systemspecs(system) {
    // const mteck = await Aim.fetch('https://aliconnect.nl/elmabv/api/mteck').get();
    Object.assign(system, await Aim.fetch('https://aliconnect.nl/elmabv/api/mteck').get());
    Object.assign(system, await loadExcelSheet('http://10.10.60.31/engineering/Engineering/Engineering/MTECK/mteck-systems-tcd.xlsx'));
    console.log({system});

    Object.assign(system, await loadExcelSheet('http://10.10.60.31/engineering/Projects/'+system.cmdb));

    project.projectinfo.forEach(item => {
      if (system.info.find(row => row.property === item.property)) {
        system.info.filter(row => row.property === item.property).forEach(row => Object.setPrototypeOf(row,item));
      } else {
        system.info.push(Object.create(item));
      }
    })
    system.info.forEach(row => system[row.property.camelCase()] = row.value);
    system.meldingen = system.meldingen || [];
    if (!system.projectfasen) {
      system.meldingen.push({type:'warning',description:'project-elma mist tab projectfasen'})
      system.projectfasen = [];
    }

    project.documenten.forEach(item => {
      const row = system.documenten.find(row => row.name === item.name);
      if (row) {
        Object.setPrototypeOf(row,item);
      } else {
        system.documenten.push(Object.create(item));
      }
    })
    system.documenten.forEach(row => system[row.name.camelCase()] = row.link);

    console.log({system});

    project.contactlist.forEach(item => {
      const row = system.contactlist.find(row => row.role === item.role);
      if (row) {
        Object.setPrototypeOf(row,item);
      } else {
        system.contactlist.push(Object.create(item));
      }
    })
    system.contactlist.forEach(item => Object.assign(item, elma.person.find(row => row.id === item.displayName)))

    system.checklist.forEach(item => Object.assign(item, project.checklist.find(row => row.onderwerp === item.onderwerp)))

    system.alarmGroups = [];
    system.alarmen = [];
    for (let bron of system.documenten.filter(item => item.name === 'Alarm Lijst' && item.bron).map(item => item.Bron)) {
      const sheet = await loadExcelSheet('http://10.10.60.31/engineering/Projects/' + system.projectfolder + '/' + bron);
      system.alarm = sheet.Alarm;
      system.alarmGroups = sheet.AlarmGroups;
    }

    system.iolist = [];
    if (system.ontwerpIoSheet) {
      const sheet = await loadExcelSheet('http://10.10.60.31/engineering/Projects/' + system.projectfolder + '/' + system.ontwerpIoSheet);
      console.log(sheet);
      system.iolist = sheet.ioLijst;
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
    console.log(system.iolist);

    system.eplaniolist = [];
    if (system.eplanIoSheet) {
      const sheet = await loadExcelSheet('http://10.10.60.31/engineering/Projects/' + system.projectfolder + '/' + system.eplanIoSheet);
      system.eplaniolist = sheet.eplSheet;
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
    // for (let bron of system.documenten.filter(item => item.name === 'Eplan IO Sheet' && item.link).map(item => item.link)) {
    // }

    system.plctags = [];
    if (system.plcTagSheet) {
      const sheet = await loadExcelSheet('http://10.10.60.31/engineering/Projects/' + system.projectfolder + '/' + system.plcTagSheet);
      system.plctags = sheet.plcTags;
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

    // console.log(system.iolist,system.eplaniolist);


    function projectfasen() {
      const projectfasen = project.projectfasen.map(fase => Object.assign({}, fase, system.projectfasen.find(item => item.fase === fase.fase)));
      return [
        $('table').class('grid').style('width:100%;').append(
          $('thead').append(
            $('th').text('Nr'),
            $('th').text('Fase'),
            $('th').text('Plan'),
            $('th').text('Gestart'),
            $('th').text('Gereed'),
          ),
          $('tbody').append(
            projectfasen.map(item => $('tr').append(
              $('td').text(item.faseNr),
              $('td').text(item.fase),
              $('td').text(excelDate(item.planStart)),
              $('td').text(excelDate(item.startDatum)),
              $('td').text(excelDate(item.eindDatum)),
            ))
          )
        ),
        projectfasen.map(fase => $('details').open(fase.startDatum && !fase.eindDatum).append(
          $('summary').text(fase.fase),
          $('table').class('grid').style('width:100%;').append(
            $('thead').append(
              $('th').text('Onderwerp'),
              $('th').text('Verantwoordelijke'),
            ),
            $('tbody').append(
              project.checklist.filter(row => row.fase === fase.fase).map(item => $('tr').append(
                $('td').text(item.onderwerp),
                $('td').text(item.verantwoordelijke),
              ))
            )
          ),
        )),
      ];
    }

    docpage().append(
      $('h1').text(system.title),
      details('Info').append(
        table().append(
          $('thead').append(
            $('th').text('Eigenschap'),
            $('th').text('Waarde').style('width:100%;'),
            $('th').text('Fase'),
          ),
          $('tbody').append(
            system.info.map(item => $('tr').append(
              $('th').text(item.property),
              $('td').text(item.type === 'date' ? excelDate(item.value) : item.value).style(item.value ? null : 'background:orange;'),
              $('td').text(item.faseNr),
            ))
          )
        ),
      ),
      details('Fasering').append(
        projectfasen(),
      ),
      details('Contactlijst').append(
        table().append(
          $('thead').append(
            $('th').text('Job title / Role'),
            $('th').text('Afk.'),
            $('th').text('Name'),
            $('th').text('Organisatie'),
            $('th').text('Initials'),
            $('th').text('Mail address'),
            $('th').text('Mobile'),
          ),
          $('tbody').append(
            system.contactlist.sort((a,b) => a.nr + b.nr).map(item => $('tr').append(
              $('td').text(item.role || item.jobTitle),
              $('td').text(item.afk),
              $('td').text(item.displayName),
              $('td').text(item.companyName),
              $('td').text(item.init),
              $('td').append($('a').text(item.mailaddress).href(`mailto:${item.mailaddress}?subject=Dossier ${system.jobNumber} - ${system.title} > &body=Beste ${item.displayName},%0D%0DAangaande het project ${system.title} met ons projectnummer ${system.jobNumber} wil ik volgende doorgeven%0D&cc=${system.contactlist.filter(item => item.cc).map(item => item.mailaddress).join(';')}`)),
              $('td').append($('a').text(item.mobile).href('tel:'+item.mobile)),
            ))
          )
        )
      ),
      details('Documenten').append(
        table().append(
          $('thead').append(
            $('th').text('Name'),
            $('th').text('Link'),
            $('th').text('Versie'),
            $('th').text('Datum'),
          ),
          $('tbody').append(
            system.documenten.map(item => $('tr').append(
              $('td').text(item.name),
              $('td').append(!item.link ? null : $('a').target('document').text(item.link.split('\\').pop()).href('http://10.10.60.31/engineering/Projects/' + system.projectfolder + '/' + item.link)),
              $('td').text(item.version),
              $('td').text(item.date),
            ))
          )
        ),
      ),
      details('Checklist').append(
        system.checklist.map(item => $('details').append(
          $('summary').text(item.Onderwerp),
          $('p').text(item.Toelichting),
        )),
      ),

      details('Revisie overzicht').append(
        table().append(
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

      details('IO lijst').append(
        system.iolist.map(item => item.location+' - '+item.group).unique().map(name => $('details').append(
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
              system.iolist.filter(item => item.location+' - '+item.group === name).map(item => $('tr').append(
                // $('td').text(item.Location),
                $('td').text(item.id),
                $('td').text(item.odc),
                $('td').text(item.description),
                $('td').text(item.type+item.pin),
                $('td').text(item.adres),
                // $('td').text(String(item.Pin).padStart(2,'0')),
                $('td').text(item.component),
                $('td').text(item.iolistItem ? item.iolistItem.description : 'Not found'),
              ))
            )
          ),
        )),
      ),
      details('IO lijst Eplan').append(
        table().style('width:100%;font-family:consolas;').append(
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
      details('IO lijst PLC').append(
        table().style('width:100%;font-family:consolas;').append(
          $('thead').append(
            $('th').text('Name'),
            $('th').text('Path'),
            $('th').text('Comment'),
          ),
          $('tbody').append(
            system.plctags.map((item,i) => $('tr').append(
              $('td').text(item.name),
              $('td').text(item.path),
              $('td').text(item.comment),
            ))
          ),
        ),
      ),



      details('Alarm lijst').append(
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
      details('Meldingen').append(
        system.meldingen.map(item => $('li').text(item.description)),
      )
    );

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
            projectActiveMut.forEach(item => {
              project_active_all.filter(a => a.projectNr.trim() === item.project.trim()).forEach(prj => {
                item.debName = prj.debName;
                item.description = prj.description;
                item.status = prj.status;
              })
            })

            const eng = [
              'Abdel Arichi',
              'Andries Quispel',
              'Dennis van den Hout',
              'Eddy van Maren',
              'Edward van Dijk',
              'Evert-Jan van Leeuwen',
              'Henri van der Horst',
              'Johan Scholten',
              'Lennard Mensch',
              'Matthijs Weijers',
              'Mittro van Lissa',
              'Rik Baks',
              'Ronald Stout',
              'Sorin Zaharia',
              'Vlad Costea',
              'William Kok',
              'Johan Scholten',
            ];
            const enguren = projectActiveMut.filter(item => item.status === 'A' && eng.includes(item.medewerker.trim()));
            const todo = [];
            enguren.forEach(item => {
              let r = todo.find(r => r.projectnr === item.project);
              if (!r) {
                todo.push(r = {projectnr:item.project,description:item.description,debName:item.debName,onderwerp:'Engineering',resources:[]});
              }
              r.resources.push(item.medewerker.trim());
              r.resources = r.resources.unique();
            })
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
                    details('Todo').append(
                      table().append(
                        $('thead').append(
                          $('th').text('Klant'),
                          $('th').text('Project'),
                          $('th').text('Deel'),
                          $('th').text('Projectnr'),
                          $('th').text('Nr'),
                          $('th').text('Onderwerp'),
                          $('th').text('Owner'),
                        ),
                        $('tbody').append(
                          todo.map(item => $('tr').append(
                            $('td').text(item.debName),
                            $('td'),
                            $('td').text(item.description),
                            $('td').text(item.projectnr),
                            $('td'),
                            $('td').text(item.onderwerp),
                            $('td').text(item.resources.join(';')),
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
        MHS: {onclick: () => companyprofile('material handling projects')},
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
    Engineering: {
      children: {
        ToDo: {
          async onclick() {
            engineering = await loadExcelSheet('http://10.10.60.31/engineering/Engineering/engineering.xlsx');
            mom(engineering.todo);
          },
        },
        Handboek: {
          onclick() {
            handboek(projects);
          },
        },
      }
    },
    Projects: {
      children: Object.fromEntries(projects.projects.map(system => [system.title,{
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
