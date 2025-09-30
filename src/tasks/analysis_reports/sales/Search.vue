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
          <template v-for="column in taskData.columns.selectable">
            <div class="col-sm-6 col-md-3">
              <label><input type="checkbox" :value="column" :checked="taskData.columns.hidden.indexOf(column)<0" @change="toggleReportControlColumns($event)"> {{labels.get('label_'+column)}}</label>
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
            <th :style="'width: '+(column.width?column.width:150)+'px;'" v-if="taskData.columns.hidden.indexOf(column.group)<0" :key="'th_'+key">
              <div v-html="column.label"></div>
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
        <template v-for="row in taskData.itemsFiltered">
          <tr v-for="index  in row['num_rows']" >
            <template v-for="(column,key) in taskData.columns.all">
              <td :class="((['quantity','unit_price','market_size_arm','amount'].indexOf(column.group) != -1)?'text-right':'')" v-if="taskData.columns.hidden.indexOf(column.group)<0">
                <template v-if="index==1">
                  <template v-if="column.group=='amount'">{{ row[column.key]?row[column.key].toFixed(2):'' }}</template>
                  <template v-else-if="column.group=='quantity'">{{ row[column.key]?row[column.key].toFixed(3):'' }}</template>
                  <template v-else>{{ row[column.key] }}</template>
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
    let distributors_object={};
    for(let i in taskData.distributors){
      let distributor_id=taskData.distributors[i]['id'];
      distributors_object[distributor_id]=taskData.distributors[i];
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
        options:[{value:'crop_fiscal_year',label:'Crop - Fiscal Year'},{value:'type_fiscal_year',label:'Type - Fiscal Year'},{value:'variety_fiscal_year',label:'Variety - Fiscal Year'}],
        default:'crop_fiscal_year',
        mandatory:true,
        noselect:true,
      };
      key='fiscal_year';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:new Array(globalVariables.current_fiscal_year-globalVariables.sales_starting_year+1).fill().map((temp,index) => {return {value:globalVariables.current_fiscal_year-index,label:(globalVariables.current_fiscal_year-index)+' - '+(globalVariables.current_fiscal_year-index+1)}}),
        default:globalVariables.current_fiscal_year,
        mandatory:true,
        noselect:true,
      };
      key='num_fiscal_years';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:new Array(globalVariables.current_fiscal_year-globalVariables.sales_starting_year+1).fill().map((temp,index) => {return {value:index+1,label:index+1}}),
        default:'',
        mandatory:false,
        noselect:true,
      };
      key='month';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:new Array(12).fill().map((temp,index) => {return {value:index+1,label:labels.get('label_month_short_'+(index+1))}}),
        default:'',
        mandatory:false
      };

      key='sales_from';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'date',
        default:item.data[key],
        mandatory:true
      };
      key='sales_to';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'date',
        default:item.data[key],
        mandatory:true
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
      key='distributor_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:(taskData.user_locations.territory_id>0)?taskData.distributors.filter((temp)=>{ if((temp.territory_id==taskData.user_locations.territory_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
        default:item.data[key],
        mandatory:false
      };


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
      key='pack_size_id';
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
          if((options['report_format']=='crop_fiscal_year')||(options['report_format']=='type_fiscal_year')||(options['report_format']=='variety_fiscal_year')){
            let sales_data_key='crop_id';
            columns_all.push({'group':'crop_name','key':'crop_name','label':labels.get('label_crop_name')})
            if(options['report_format']=='type_fiscal_year'){
              columns_all.push({'group':'type_name','key':'type_name','label':labels.get('label_type_name')})
              sales_data_key='crop_type_id';
            }
            else if(options['report_format']=='variety_fiscal_year'){
              columns_all.push({'group':'type_name','key':'type_name','label':labels.get('label_type_name')})
              columns_all.push({'group':'variety_name','key':'variety_name','label':labels.get('label_variety_name')})
              sales_data_key='variety_id';
            }
            let fiscal_year=options['fiscal_year'];

            for(let i=0;i<options['num_fiscal_years'];i++){
              columns_all.push({'group':'quantity','key':'quantity_'+(+fiscal_year-i),'label':((+fiscal_year-i)+' - '+(+fiscal_year-i+1))+'</br>('+labels.get('label_quantity')+')'})
              columns_all.push({'group':'amount','key':'amount_'+(+fiscal_year-i),'label':((+fiscal_year-i)+' - '+(+fiscal_year-i+1))+'</br>('+labels.get('label_amount')+')'})
            }
            if(options['report_format']=='crop_fiscal_year'){
              for(let i in taskData.crops){
                let crop=taskData.crops[i];
                if(options['status']!='All' && crop['status']!=options['status'])
                  continue;
                if(options['crop_id']>0){
                  if(options['crop_id']!=crop['id']){
                    continue;
                  }
                }
                rows[crop['id']]={}
                rows[crop['id']]['id']=crop['id'];
                rows[crop['id']]['num_rows']=1;
                rows[crop['id']]['crop_name']=crop['name'];
                rows_array.push(rows[crop['id']])//for ordering
              }
            }
            else if(options['report_format']=='type_fiscal_year'){
              for(let i in taskData.crop_types){
                let crop_type=taskData.crop_types[i];
                if(options['status']!='All' && crop_type['status']!=options['status'])
                  continue;
                if(options['crop_id']>0){
                  if(options['crop_type_id']>0){
                    if(options['crop_type_id']!=crop_type['crop_type_id']){
                      continue;
                    }
                  }
                  else if(options['crop_id']!=crop_type['crop_id']){
                    continue;
                  }
                }
                rows[crop_type['id']]={}
                rows[crop_type['id']]['id']=crop_type['id'];
                rows[crop_type['id']]['num_rows']=1;
                rows[crop_type['id']]['crop_name']=crop_type['crop_name'];
                rows[crop_type['id']]['type_name']=crop_type['name'];
                rows_array.push(rows[crop_type['id']])//for ordering

              }
            }
            else if(options['report_format']=='variety_fiscal_year'){
              for(let i in taskData.varieties){
                let variety=taskData.varieties[i];
                if(options['status']!='All' && variety['status']!=options['status'])
                  continue;
                if(variety['whose']!='ARM')
                  continue;
                if(options['crop_id']>0){
                  if(options['crop_type_id']>0){
                    if(options['variety_id']>0){
                      if(options['variety_id']!=variety['id']){
                        continue;
                      }
                    }
                    else if(options['crop_type_id']!=variety['crop_type_id']){
                      continue;
                    }
                  }
                  else if(options['crop_id']!=variety['crop_id']){
                    continue;
                  }
                }
                rows[variety['id']]={}
                rows[variety['id']]['id']=variety['id'];
                rows[variety['id']]['num_rows']=1;
                rows[variety['id']]['crop_name']=variety['crop_name'];
                rows[variety['id']]['type_name']=variety['crop_type_name'];
                rows[variety['id']]['variety_name']=variety['name'];
                rows_array.push(rows[variety['id']])//for ordering

              }
            }
            for(let id in rows){
              for(let i=0;i<options['num_fiscal_years'];i++){
                rows[id]['quantity_'+(+fiscal_year-i)]=0;
                rows[id]['amount_'+(+fiscal_year-i)]=0;
              }
            }
            for(let i in res.data.items){
              let sales_data=res.data.items[i];
              let date=moment(sales_data['sales_at'])
              let year=date.year();
              let month=date.month()+1;
              if(month<globalVariables.fiscal_year_starting_month){
                year--;
              }
              if(rows[sales_data[sales_data_key]] && rows[sales_data[sales_data_key]]['quantity_'+year]>=0){
                rows[sales_data[sales_data_key]]['quantity_'+year]+=(+sales_data['quantity']);
                rows[sales_data[sales_data_key]]['amount_'+year]+=(+sales_data['amount']);
              }
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
      systemFunctions.exportCsvFromHtmlTable('#table_report','Sales Report '+$('#report_format').val())
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
      table_width.value=systemFunctions.calculateReportTableWidth(taskData.columns);
    }
    setInputFields();
    $(document).ready(async function()
    {
      $(document).off("change", "#report_format");
      $(document).on("change",'#report_format',function()
      {
        show_report.value=false;
        let report_format=$(this).val();
        let columns_selectable=[];
        let columns_hidden=[]
        if((report_format=='crop_fiscal_year')||(report_format=='type_fiscal_year') || (report_format=='variety_fiscal_year' )){
          columns_selectable=['quantity','amount'];
        }
        taskData.columns.selectable=columns_selectable;
        taskData.columns.hidden=columns_hidden;
      })
      $(document).off("change", "#fiscal_year");
      $(document).on("change",'#fiscal_year',async function()
      {
        let fiscal_year=$(this).val();
        if(fiscal_year>0){
          let start_date_temp=moment(fiscal_year+'-'+globalVariables.fiscal_year_starting_month+'-01','YYYY-MM-DD');
          let end_date=start_date_temp.clone().add(1,'year').add(-1,'day')
          let start_date=start_date_temp.clone()
          if($("#num_fiscal_years").val()>1){
            start_date=start_date_temp.clone().add(($("#num_fiscal_years").val()*-1+1),'year')
          }

          $("#sales_from").val(start_date.format('YYYY-MM-DD'))
          $("#sales_to").val(end_date.format('YYYY-MM-DD'))
        }
        else{
          $("#sales_from").val(moment().startOf('month').format('YYYY-MM-DD'))
          $("#sales_to").val(moment().endOf('month').format('YYYY-MM-DD'))
        }
      });
      await systemFunctions.delay(10);
      $('#report_format').trigger('change');
      $('#fiscal_year').trigger('change')


      $(document).off("change", "#num_fiscal_years");
      $(document).on("change",'#num_fiscal_years',async function()
      {
        $('#fiscal_year').trigger('change')
      });

      $(document).off("change", "#crop_id");
      $(document).on("change",'#crop_id',async function()
      {
        let crop_id=$(this).val();
        let key='crop_type_id';
        item.inputFields3[key].options=taskData.crop_types.filter((temp)=>{ if((temp.crop_id==crop_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='variety_id';
        item.inputFields3[key].options=[];
        $('#'+key).val('');
        key='pack_size_id';
        item.inputFields3[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#crop_type_id");
      $(document).on("change",'#crop_type_id',async function()
      {

        let crop_type_id=$(this).val();
        let key='variety_id';
        console.log(crop_type_id)
        item.inputFields3[key].options=taskData.varieties.filter((temp)=>{ if((temp.crop_type_id==crop_type_id) && (temp.whose=='ARM') && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='pack_size_id';
        item.inputFields3[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#variety_id");
      $(document).on("change",'#variety_id',async function()
      {
        let variety_id=$(this).val();
        let key='pack_size_id';
        item.inputFields3[key].options=taskData.pack_sizes.filter((temp)=>{ if((temp.variety_id==variety_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
      })

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
        key='distributor_id';
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
        key='distributor_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#territory_id");
      $(document).on("change",'#territory_id',async function()
      {
        let territory_id=$(this).val();
        let key='distributor_id';
        item.inputFields2[key].options=taskData.distributors.filter((temp)=>{ if((temp.territory_id==territory_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
      })

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