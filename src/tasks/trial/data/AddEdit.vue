<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="(taskData.api_url+'/'+taskData.crop_id+'/'+taskData.form_id+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id)" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header">
      {{taskData.year}}-{{item.season_name}}-{{taskData.cropInfo.name}}-{{taskData.formInfo.name}}-({{item.variety.rnd_code}})
    </div>
    <div class="card-body">
      <form id="formSaveItem">
        <input type="hidden" name="save_token" :value="new Date().getTime()">
        <div class="row mb-2"  v-if="item.variety.replica=='Yes'">
          <div class="col-4">
          </div>
          <div class="text-center btn btn-primary col-4">
            {{labels.get('Normal')}}
          </div>
          <div class="text-center btn btn-danger col-4">
            {{labels.get('Replica')}}
          </div>
        </div>
        <template v-for="inputField in taskData.inputFields">
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{inputField.name}}<span class="text-danger" v-if="inputField.mandatory=='Yes'">*</span></label>
            </div>
            <template v-for="i in (item.variety.replica=='Yes'?2:1)">
              <div :class="item.variety.replica=='Yes'?'col-4':'col-lg-4 col-8'">
                <textarea v-if="inputField.type=='textarea'" :id="'item_'+i+'_'+inputField.id" class="form-control" :name="'item[data_'+i+']['+inputField.id+']'">{{item['data_'+i][inputField.id]}}</textarea>
                <div v-else-if="inputField.type=='image'">
                  <div class="row mb-2">
                    <div class="col-12">
                      <div class="input-group input-group-sm">
                        <div class="input-group-prepend">
                          <label class="btn btn-sm bg-gradient-primary" style="cursor: pointer;">
                            <input v-if="inputField.class>1" :data-minimum-size-to-resize="inputField.class*1024*1024" :id="'item_'+i+'_'+inputField.id" type="file" class="d-none" :data-preview-container="'#item_'+i+'_'+inputField.id+'_preview_container'">
                            <input v-else :id="'item_'+i+'_'+inputField.id" type="file" class="d-none" :data-preview-container="'#item_'+i+'_'+inputField.id+'_preview_container'">
                            <i class="bi bi-upload"></i> {{labels.get('label_upload_file')}}
                          </label>
                        </div>
                        <label class="form-control custom-file-name"></label>
                        <div class="input-group-append clear_file" @click="resetFile('item_'+i+'_'+inputField.id,item['data_'+i][inputField.id])">
                          <label class="btn btn-sm bg-gradient-info" style="cursor: pointer;">{{labels.get('clear')}}</label>
                        </div>
                        <input :id="'item_'+i+'_'+inputField.id+'_file_input'" type="hidden" :name="'item[data_'+i+']['+inputField.id+']'" :value="item['data_'+i][inputField.id]" />
                      </div>
                    </div>
                  </div>
                  <div class="row mb-2">
                    <div class="col-12 system_preview_container" :id="'item_'+i+'_'+inputField.id+'_preview_container'">
                      <img style="max-width: 100%;max-height:200px" :src="systemFunctions.getImageUrl(item['data_'+i][inputField.id])">
                    </div>
                  </div>
                </div>
                <div v-else-if="inputField.type=='dropdown'" class="input-group" >
                  <select :id="'item_'+i+'_'+inputField.id" class="form-control" :name="'item[data_'+i+']['+inputField.id+']'">
                    <option value="">{{labels.get('label_select')}}</option>
                    <option v-for="option in (inputField.options?inputField.options.split('\r\n'):[])" :value="option" :selected="item['data_'+i][inputField.id]==option">
                      {{option}}
                    </option>
                  </select>
                </div>
                <div v-else-if="inputField.type=='features'" class="input-group" >
                  <div class="form-check form-check-inline" v-for="option in (item.variety.crop_features)">
                    <input class="form-check-input" type="checkbox" :id="'item_'+i+'_'+inputField.id+'_'+option.id" :value="option.id" :name="'item[data_'+i+']['+inputField.id+'][]'" :checked="item['data_'+i][inputField.id]?item['data_'+i][inputField.id].includes(option.id.toString()):false">
                    <label class="form-check-label" :for="'item_'+inputField.id+'_'+option.id">{{option.name}}</label>
                  </div>
                </div>
                <div v-else-if="inputField.type=='checkbox'" class="input-group" >
                  <div class="form-check form-check-inline" v-for="(option,index) in (inputField.options?inputField.options.split('\r\n'):[])">
                    <input class="form-check-input" type="checkbox" :id="'item_'+i+'_'+inputField.id+'_'+index" :value="option" :name="'item[data_'+i+']['+inputField.id+'][]'" :checked="item['data_'+i][inputField.id]?item['data_'+i][inputField.id].includes(option):false">
                    <label class="form-check-label" :for="'item_'+inputField.id+'_'+index">{{option}}</label>
                  </div>
                </div>
                <div v-else-if="inputField.type=='url'" class="input-group" >
                  <input :id="'item_'+i+'_'+inputField.id" :type="inputField.type" class="form-control input_url" :class="inputField.class? inputField.class:null" :name="'item[data_'+i+']['+inputField.id+']'" :value="item['data_'+i][inputField.id]"/>
                  <a href="http://" target="_blank" class="input-group-text">Visit URL</a>
                </div>
                <div v-else class="input-group" >
                  <input :id="'item_'+i+'_'+inputField.id" :type="inputField.type" class="form-control" :class="inputField.class? inputField.class:null" :name="'item[data_'+i+']['+inputField.id+']'" :value="item['data_'+i][inputField.id]"/>
                </div>
              </div>
            </template>
          </div>
        </template>
      </form>
    </div>
  </div>
</template>
<script setup>

import globalVariables from "@/assets/globalVariables";
import systemFunctions from "@/assets/systemFunctions";
import toastFunctions from "@/assets/toastFunctions";
import labels from '@/labels'

import {useRouter} from "vue-router";
import {inject, reactive} from "vue";
import axios from "axios";
import InputTemplate from '@/components/InputTemplate.vue';
import {useRoute} from "vue-router/dist/vue-router";


const route =useRoute()
const router =useRouter()
let taskData = inject('taskData');
console.log(taskData)
let item=reactive({
  variety_id:0,
  variety:{},
  season_name:'',
  exists:false,
  entry_no:0,
  data_1:{},
  data_2:{},
})
const save=async ()=>{
  console.log('save');
  let saveData=false;
  let fileFormData=await systemFunctions.getImageFormData('formSaveItem');
  if(systemFunctions.isFormDataEmpty(fileFormData)){
    saveData=true;
  }
  else{
    globalVariables.uploadingFiles=1;
    fileFormData.set('upload_dir','trial-data/'+taskData.year+'/'+taskData.trial_station_id+'/'+taskData.season_id+'/'+taskData.crop_id+'/'+taskData.form_id)
    //fileFormData.set('type','file')//if not image
    //fileFormData.set('max_size','10240')//if needed more than 3mb
    await axios.post(globalVariables.baseURLUploadServer+'/upload',fileFormData).then((res)=>{
      if (res.data.error == "") {
        let uploadData = res.data.uploaded_files;
        for(let key in uploadData){
          $('#'+key+'_file_input').val(uploadData[key].path)
        }
        saveData=true;
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
  }
  if(saveData){
    console.log("Ready to save")
    let formData=new FormData(document.getElementById('formSaveItem'));
    formData.append('item[year]',taskData.year);
    formData.append('item[trial_station_id]',taskData.trial_station_id);
    formData.append('item[season_id]',taskData.season_id);
    formData.append('item[variety_id]',item.variety_id);
    formData.append('item[entry_no]',item.entry_no);
    await axios.post(taskData.api_url+'/'+taskData.crop_id+'/'+taskData.form_id+'/save-item',formData).then((res)=>{
      if (res.data.error == "") {
        globalVariables.loadListData=true;
        router.push(taskData.api_url+'/'+taskData.crop_id+'/'+taskData.form_id+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id)
      }
      else{
        toastFunctions.showResponseError(res.data)    }
    })
  }
}
const resetFile=(fileId,defaultUrl)=>{
  $('#'+fileId).val('').trigger('change');
  $('#'+fileId+'_preview_container img').attr('src',systemFunctions.getImageUrl(defaultUrl));
}
const getItem=async ()=>{
  item.variety_id=route.params['variety_id'];
  item.entry_no=route.params['entry_no'];
  for(let i in taskData.items){
    let variety=taskData.items[i];
    if(variety.variety_id==item.variety_id){
      variety.crop_features={};
      let crop_feature_ids=variety.crop_feature_ids.split(",");
      for(let i=0;i<crop_feature_ids.length;i++){
        if(taskData.crop_features[crop_feature_ids[i]]){
          variety.crop_features[crop_feature_ids[i]]=taskData.crop_features[crop_feature_ids[i]];
        }
      }
      item.variety=variety;
    }
  }
  for(let i=0;i<taskData.seasons.length;i++){
    let season=taskData.seasons[i];
    if(season.id==taskData.season_id){
      item.season_name=season.name;
    }
  }
  await axios.get(taskData.api_url+'/'+taskData.crop_id+'/'+taskData.form_id+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id+'/get-item/'+item.variety_id+'/'+item.entry_no).then((res)=>{
    if (res.data.error == "") {
      item.data_1=res.data.data_1;
      item.data_2=res.data.data_2;
      item.exists=true;
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
getItem();
</script>