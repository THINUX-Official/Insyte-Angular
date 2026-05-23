import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

import {AuthService} from '../services/auth.service';
import {AppPermission} from '../permissions/app-permissions';

@Directive({
    selector: '[appHasPermission]',
    standalone: true
})
export class HasPermissionDirective {
    private permission?: AppPermission;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private authService: AuthService
    ) {
    }

    @Input()
    set appHasPermission(permission: AppPermission) {
        this.permission = permission;
        this.updateView();
    }

    private updateView(): void {
        this.viewContainer.clear();

        if (this.permission && this.authService.hasPermission(this.permission)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        }
    }
}
