<template>
  <div id="accordion">
    <div class="card d-print-none">
      <div class="card-header p-1">
        <a class="btn btn-sm" data-toggle="collapse" href="#label_task">{{labels.get('label_task')}} </a>
      </div>
      <div id="label_task" class="collapse show" v-if="item.exists">
        <form id="formSearch">
          <div class="row mt-2">
            <div class="input_container col-lg-4">
              <InputTemplate :inputItems="item.inputFields1" />
            </div>
            <div class="input_container col-lg-4">
              <InputTemplate :inputItems="item.inputFields2" />
            </div>
            <div class="input_container col-lg-4">
              <InputTemplate :inputItems="item.inputFields3" />
            </div>
          </div>
        </form>
        <div class="row">
          <div class="col-12 text-center">
            <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="search"><i class="feather icon-save"></i> {{labels.get('label_search')}}</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card d-print-none" v-if="taskData.permissions.action_8">
      <div class="card-header p-1">
        <a class="btn btn-sm" data-toggle="collapse" href="#label_action_8">{{labels.get('action_8')}} </a>
      </div>
      <div id="label_action_8" class="collapse show" v-if="item.exists">
        <div class="row card-body">
          <div class="col-12 text-center">
            <label><input type="checkbox" id="select_all"> {{labels.get('label_select_all')}}</label>
          </div>
          <template v-for="column in taskData.columns.selectable">
            <div class="col-sm-6 col-md-2">
              <label><input class="select_month" type="checkbox" :value="column" :checked="taskData.columns.hidden.indexOf(column)<0" @change="toggleReportControlColumns($event)"> {{labels.get('label_'+column)}}</label>
            </div>
          </template>
        </div>
      </div>
    </div>

  </div>
  <div class="card" v-if="show_report">
    <div class="card-body pb-0 d-print-none">
      <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" onclick="window.print();"><i class="feather icon-printer"></i> {{labels.get('action_4')}}</button>
      <button type="button" v-if="taskData.permissions.action_5" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="exportCsv"><i class="feather icon-download"></i> {{labels.get('action_5')}}</button>
    </div>
    <div class="card-body" style='overflow-x:auto;height:600px;padding: 0'>
      <table id="table_report" :style="'width: '+table_width+'px'" class="table table-bordered sticky">
        <thead class="table-active">
        <tr>
          <template v-for="(column,key) in taskData.columns.all">
            <th style="width: 150px;" v-if="taskData.columns.hidden.indexOf(column.group)<0" :key="'th_'+key">
              <div v-html="column.label"></div>
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
        <template v-for="row in taskData.itemsFiltered">
          <tr v-for="index  in row['num_rows']" >
            <template v-for="(column,key) in taskData.columns.all">
              <td :class="((['crop_name','type_name','variety_name','territory_name'].indexOf(column.group) == -1)?'text-right':'')" v-if="taskData.columns.hidden.indexOf(column.group)<0">
                <template v-if="index==1">
                  <template v-if="(['crop_name','type_name','variety_name','part_name','area_name','territory_name'].indexOf(column.group) != -1)">{{ row[column.key] }}</template>

                  <template v-else>
                    <div :style="'background-color: '+(type_months_color_object[row[column.key]]?type_months_color_object[row[column.key]]['color']:'#000000')">
                      &nbsp;{{ row[column.key] }}
                    </div>
                  </template>
                </template>
                <template v-else>&nbsp</template>
              </td>
            </template>
          </tr>
        </template>
        </tbody>
      </table>
    </div>

  </div>
</template>
<script setup>
    import globalVariables from "@/assets/globalVariables";
    import systemFunctions from "@/assets/systemFunctions";

    import labels from '@/labels'
    import {inject, reactive, ref} from 'vue'
    import {useRouter} from 'vue-router';
    import axios from "axios";
    import InputTemplate from '@/components/InputTemplate.vue';
    import ColumnControl from '@/components/ColumnControl.vue';
    import toastFunctions from "@/assets/toastFunctions";

    const router =useRouter()
    let taskData = inject('taskData')
    let show_report=ref(false)
    let table_width=ref(0)
    let show_column_controls=ref(false)
    let item=reactive({
      exists:false,
      inputFields1:{},
      inputFields2:{},
      inputFields3:{},
      data:{
      }
    })

    let crops_object={};
    for(let i in taskData.crops){
      crops_object[taskData.crops[i]['id']]=taskData.crops[i];
    }
    let crop_types_object={};
    for(let i in taskData.crop_types){
      crop_types_object[taskData.crop_types[i]['id']]=taskData.crop_types[i];
    }
    let varieties_object={};
    for(let i in taskData.varieties){
      varieties_object[taskData.varieties[i]['id']]=taskData.varieties[i];
    }

    let location_parts_object={};
    for(let i in taskData.location_parts){
      let part_id=taskData.location_parts[i]['id'];
      location_parts_object[part_id]=taskData.location_parts[i];
    }
    let location_areas_object={};
    for(let i in taskData.location_areas){
      let area_id=taskData.location_areas[i]['id'];
      location_areas_object[area_id]=taskData.location_areas[i];
    }
    let location_territories_object={};
    for(let i in taskData.location_territories){
      let territory_id=taskData.location_territories[i]['id'];
      location_territories_object[territory_id]=taskData.location_territories[i];
    }
    let type_months_color_object={};
    for(let i in taskData.type_months_color){
      type_months_color_object[taskData.type_months_color[i]['value']]=taskData.type_months_color[i];
    }

    const setInputFields=async ()=>{
      item.inputFields1= {};
      item.inputFields2= {};
      item.inputFields3= {};
      await systemFunctions.delay(1);
      let inputFields={}
      let key='report_format';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[{value:'type',label:'Type Wise'},{value:'variety',label:'Variety Wise'},{value:'territory',label:'Territory wise'},
        ],
        default:'variety',
        mandatory:true,
        noselect:true,
      };
      key='month_status';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.type_months_color.filter((temp)=>{ if(temp.status=='Active'){temp.value=temp.value.toString();temp.label=temp.name;return true}}),
        default:item.data[key],
        mandatory:false,
        noselect:true,
      };
      inputFields[key]['options'].unshift({value:-1,label:labels.get('label_select')})//to change select value different
      key='month';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:new Array(12).fill().map((temp,index) => {return {value:index+1,label:labels.get('label_month_short_'+(index+1))}}),
        default:globalVariables.current_month,
        mandatory:false,
        noselect:true
      };
      item.inputFields1=inputFields;

      //inputFields2
      inputFields={}

      key='part_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.location_parts.filter((temp)=>{ if(temp.status=='Active'){temp.value=temp.id.toString();temp.label=temp.name;return true}}),
        default:item.data[key],
        mandatory:false
      };
      if(taskData.user_locations.part_id>0){
        inputFields[key] = {
          name: 'options[' +key +']',
          label: labels.get('label_'+key),
          type:'hidden',
          default:taskData.user_locations.part_id,
          mandatory:true
        };
        key='part_name';
        inputFields[key] = {
          name: key,
          label: labels.get('label_'+key),
          type:'textonly',
          default: location_parts_object[taskData.user_locations.part_id]['name'],
          mandatory:false
        };
      }
      key='area_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:(taskData.user_locations.part_id>0)?taskData.location_areas.filter((temp)=>{ if((temp.part_id==taskData.user_locations.part_id)&&(temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
        default:item.data[key],
        mandatory:false
      };
      if(taskData.user_locations.area_id>0){
        inputFields[key] = {
          name: 'options[' +key +']',
          label: labels.get('label_'+key),
          type:'hidden',
          default:taskData.user_locations.area_id,
          mandatory:true
        };
        key='area_name';
        inputFields[key] = {
          name: key,
          label: labels.get('label_'+key),
          type:'textonly',
          default: location_areas_object[taskData.user_locations.area_id]['name'],
          mandatory:false
        };
      }
      key='territory_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:(taskData.user_locations.area_id>0)?taskData.location_territories.filter((temp)=>{ if((temp.area_id==taskData.user_locations.area_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
        default:item.data[key],
        mandatory:false
      };
      if(taskData.user_locations.territory_id>0){
        inputFields[key] = {
          name: 'options[' +key +']',
          label: labels.get('label_'+key),
          type:'hidden',
          default:taskData.user_locations.territory_id,
          mandatory:true
        };
        key='territory_name';
        inputFields[key] = {
          name: key,
          label: labels.get('label_'+key),
          type:'textonly',
          default: location_territories_object[taskData.user_locations.territory_id]['name'],
          mandatory:false
        };
      }


      item.inputFields2=inputFields;
      //inputFields3
      inputFields={}
      key='crop_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.crops.filter((temp)=>{ if(temp.status=='Active'){temp.value=temp.id.toString();temp.label=temp.name;return true}}),
        default:item.data[key],
        mandatory:false
      };
      key='crop_type_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[],
        default:item.data[key],
        mandatory:false
      };
      key='variety_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[],
        default:item.data[key],
        mandatory:true
      };
      key='status';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[{label:"All",value:'All'},{label:"Active",value:'Active'},{label:"In-Active",value:'In-Active'}],
        default:'Active',
        mandatory:true,
        noselect:true,
      };

      item.inputFields3=inputFields;

      await systemFunctions.delay(1);
      item.exists=true;
      await systemFunctions.delay(1);
      $('.input_container div').removeClass('col-lg-4')//to fix size

    }
    const search=async ()=>{
      show_report.value=false;
      let options={};
      $('#formSearch :input').each(function() {
        options[$(this).attr('id')]=$(this).val();
      });
      let formData=new FormData(document.getElementById('formSearch'))
      await axios.post(taskData.api_url+'/get-items',formData).then((res)=>{
        if (res.data.error == "") {
          taskData.itemsFiltered=[];
          let columns_all=[];
          let rows={};
          let rows_array=[];

          let data_items={}
          let data_items_key='type_id'
          //options:[{value:'type',label:'Type Wise'},{value:'variety',label:'Variety Wise'},{value:'territory',label:'Territory wise'},
          if((options['report_format']=='type')||(options['report_format']=='variety')){
            columns_all.push({'group':'crop_name','key':'crop_name','label':labels.get('label_crop_name')})
            columns_all.push({'group':'type_name','key':'type_name','label':labels.get('label_type_name')})
            if((options['report_format']=='variety')){
              columns_all.push({'group':'variety_name','key':'variety_name','label':labels.get('label_variety_name')})
            }
          }
          else if(options['report_format']=='territory'){
            data_items_key='territory_id';
            columns_all.push({'group':'part_name','key':'part_name','label':labels.get('label_part_name')})
            columns_all.push({'group':'area_name','key':'area_name','label':labels.get('label_area_name')})
            columns_all.push({'group':'territory_name','key':'territory_name','label':labels.get('label_territory_name')})
          }
          for(let i in res.data.items){
            let datum=res.data.items[i];
            if(data_items[datum[data_items_key]]){
              for(let j=1;j<13;j++){
                if(data_items[datum[data_items_key]]['month_'+j]<datum['month_'+j]){
                  data_items[datum[data_items_key]]['month_'+j]=datum['month_'+j]
                }
              }
            }
            else{
              data_items[datum[data_items_key]]=datum
            }
          }
          for(let i=1;i<13;i++){
            columns_all.push({'group':'month_short_'+i,'key':'month_short_'+i,'label':labels.get('label_month_short_'+i)})
          }
          if(options['report_format']=='type') {
            for (let i in taskData.crop_types) {
              let crop_type = taskData.crop_types[i];
              if(!data_items[crop_type['id']]){
                continue;
              }
              if(options['status']!='All' && crop_type['status']!=options['status'])
                continue;

              rows[crop_type['id']] = {}
              rows[crop_type['id']]['id'] = crop_type['id'];
              rows[crop_type['id']][data_items_key] = crop_type['id'];
              rows[crop_type['id']]['num_rows'] = 1;
              rows[crop_type['id']]['crop_name'] = crop_type['crop_name'];
              rows[crop_type['id']]['type_name'] = crop_type['name'];
              rows_array.push(rows[crop_type['id']])//for ordering
            }
          }
          else if(options['report_format']=='variety'){
            for(let i in taskData.varieties){
              let variety=taskData.varieties[i];
              if(!data_items[variety['crop_type_id']]){
                continue;
              }
              if(options['status']!='All' && variety['status']!=options['status'])
                continue;
              if(options['variety_id']>0){
                if(options['variety_id']!=variety['id']){
                  continue;
                }
              }
              rows[variety['id']]={}
              rows[variety['id']]['id'] = variety['id'];
              rows[variety['id']][data_items_key] = variety['crop_type_id'];
              rows[variety['id']]['num_rows']=1;
              rows[variety['id']]['crop_name']=variety['crop_name'];
              rows[variety['id']]['type_name']=variety['crop_type_name'];
              rows[variety['id']]['variety_name']=variety['name'];
              rows_array.push(rows[variety['id']])//for ordering
            }
          }
          else if(options['report_format']=='territory') {
            for (let i in taskData.location_territories) {
              let territory = taskData.location_territories[i];
              if(!data_items[territory['id']]){
                continue;
              }
              if(options['status']!='All' && territory['status']!=options['status'])
                continue;

              rows[territory['id']] = {}
              rows[territory['id']]['id'] = territory['id'];
              rows[territory['id']][data_items_key] = territory['id'];
              rows[territory['id']]['num_rows'] = 1;
              rows[territory['id']]['part_name'] = territory['part_name'];
              rows[territory['id']]['area_name'] = territory['area_name'];
              rows[territory['id']]['territory_name'] = territory['name'];
              rows_array.push(rows[territory['id']])//for ordering
            }
          }
          for(let i in rows){
            for(let j=1;j<13;j++){
              rows[i]['month_short_'+j]=data_items[rows[i][data_items_key]]['month_'+j]
            }
          }

          //For ordering
          for(let i in rows_array){
            rows_array[i]=rows[rows_array[i]['id']]
          }
          taskData.itemsFiltered=rows_array;
          taskData.columns.all=columns_all;
          calculateTableWidth();
          show_report.value=true;
        }
        else{
          toastFunctions.showResponseError(res.data)
        }
      });
    }
    const exportCsv=async ()=>{
      systemFunctions.exportCsvFromHtmlTable('#table_report',labels.get('label_task'))
    }
    const toggleReportControlColumns=(event)=>{
      //show_report.value=false;
      let key=event.target .value;
      if(event.target .checked){
        taskData.columns.hidden=taskData.columns.hidden.filter(function(value) {return value !== key});
      }
      else{
        taskData.columns.hidden.push(key);
      }
      calculateTableWidth();
    }
    const calculateTableWidth=()=>{
      let width=0;
      for(let index in taskData.columns.all){
        if(taskData.columns.hidden.indexOf(taskData.columns.all[index].group)<0){
          width+=150;
        }
      }
      table_width.value=width;
    }
    setInputFields();
    $(document).ready(async function()
    {
      $(document).off("change", "#report_format");
      $(document).off("change", "#month");
      taskData.columns.selectable=[];
      taskData.columns.hidden=[];
      for(let i=1;i<13;i++){
        taskData.columns.selectable.push('month_short_'+i)
        if(i!=globalVariables.current_month)
        {
          taskData.columns.hidden.push('month_short_'+i)
        }

      }

      $(document).off("change", "#crop_id");
      $(document).on("change",'#crop_id',async function()
      {
        let crop_id=$(this).val();
        let key='crop_type_id';
        item.inputFields3[key].options=taskData.crop_types.filter((temp)=>{ if((temp.crop_id==crop_id)){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='variety_id';
        item.inputFields3[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#crop_type_id");
      $(document).on("change",'#crop_type_id',async function()
      {

        let crop_type_id=$(this).val();
        let key='variety_id';
        console.log(crop_type_id)
        item.inputFields3[key].options=taskData.varieties.filter((temp)=>{ if((temp.crop_type_id==crop_type_id) && (temp.whose=='ARM')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
      })
      $(document).off("change", "#variety_id");

      $(document).off("change", "#part_id");
      $(document).on("change",'#part_id',async function()
      {
        let part_id=$(this).val();
        let key='area_id';
        item.inputFields2[key].options=taskData.location_areas.filter((temp)=>{ if((temp.part_id==part_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='territory_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');

      })
      $(document).off("change", "#area_id");
      $(document).on("change",'#area_id',async function()
      {
        let area_id=$(this).val();
        let key='territory_id';
        item.inputFields2[key].options=taskData.location_territories.filter((temp)=>{ if((temp.area_id==area_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
      })
      $(document).off("change", "#territory_id");

      $(document).off("click", "#select_all");
      $(document).on("click",'#select_all',function()
      {
        taskData.columns.hidden=[];
        if($(this).is(':checked'))
        {
          $('.select_month').prop('checked', true);
        }
        else
        {
          $('.select_month').prop('checked', false);
          for(let i=1;i<13;i++){
            taskData.columns.hidden.push('month_short_'+i)
          }
        }
        calculateTableWidth();
      });
    });

</script>


<style scoped>

/* To show borders. overwrite bootstarp css */
table.sticky {
  border-collapse: separate;
  border-spacing: 0;
}
table.sticky >thead th{
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 1030;
  background:#f5f5f5;
  border-width: 1px;
  width: 100px;
}
table.sticky > thead > tr > th:nth-child(1){
  left: 0;
  z-index: 1040;
}
table.sticky > thead > tr > th:nth-child(2){
  left: 150px;
  z-index: 1040;
}

table.sticky > tbody > tr > td:nth-child(1){
  position: sticky;
  position: -webkit-sticky;
  left: 0;
  z-index: 1020;
  background:#f5f5f5;
  border-width: 1px;
}

table.sticky > tbody > tr > td:nth-child(2){
  position: sticky;
  position: -webkit-sticky;
  left: 150px;
  z-index: 1020;
  background:#f5f5f5;
  border-width: 1px;
}
</style>